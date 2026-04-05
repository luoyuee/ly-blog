import type { Oml2dProperties, Oml2dMethods, Oml2dEvents, ModelOptions } from "oh-my-live2d";
import { useBreakpoints, useDebounceFn } from "@vueuse/core";
import { onUnmounted } from "vue";

/** oh-my-live2d 实例的联合类型（属性 + 方法 + 事件） */
type Oml2d = Oml2dProperties & Oml2dMethods & Oml2dEvents;

/**
 * 路由匹配模式，支持两种形式：
 * - string: 直接作为正则源使用（如 "/admin" 或 "/posts/.*"）
 * - RegExp: 正则对象，直接调用 test()
 */
type HideRoutePattern = string | RegExp;

/**
 * 单条滚动显示规则配置
 *
 * @example
 * ```ts
 * { threshold: 300, routes: ["/posts/.*"] }  // 仅文章页生效
 * { threshold: 200 }                           // 全局兜底规则
 * ```
 */
interface ScrollShowRule {
  /** 触发显示所需的最小滚动距离（像素） */
  threshold: number;
  /**
   * 生效的路由列表（正则字符串或 RegExp）
   * 为空或不传则全局生效，通常作为数组最后一条兜底规则
   */
  routes?: HideRoutePattern[];
}

/**
 * Live2D 初始化配置接口
 *
 * @example
 * ```ts
 * useLive2d().init({
 *   models: [{ path: "/models/miku" }],
 *   hideRoutes: ["/admin", /^\/settings/],
 *   scrollShow: [
 *     { threshold: 300, routes: ["/posts/.*"] },
 *     { threshold: 200 },  // 兜底
 *   ],
 *   breakpoint: "lg",
 * })
 * ```
 */
interface Live2dConfig {
  /** 模型配置列表 */
  models: ModelOptions[];
  /**
   * 路由隐藏规则列表
   * 匹配到的路由将自动隐藏 Live2D（不销毁实例）
   * 支持正则字符串或 RegExp 对象
   */
  hideRoutes?: HideRoutePattern[];
  /**
   * 滚动显示规则列表
   * 按数组顺序遍历，取第一条匹配规则的阈值生效（先匹配优先）
   * 页面滚动距离达到阈值后才显示 Live2D
   */
  scrollShow?: ScrollShowRule[];
  /**
   * 触发显示的最小屏幕断点
   * 可选值：sm(640) | md(768) | lg(1024) | xl(1280) | 2xl(1536)
   * @default "lg"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}

/** composable 公开的返回值接口 */
interface UseLive2dReturn {
  /** Live2D 实例引用（未加载时为 null） */
  instance: Ref<Oml2d | null>;
  /** 初始化 composable（注册监听器，不立即加载模型） */
  init: (config: Live2dConfig) => Promise<void>;
  /** 手动显示 Live2D */
  show: () => void;
  /** 手动隐藏 Live2D */
  hide: () => void;
  /** 清理所有事件监听器并重置状态（组件卸载时调用） */
  cleanup: () => void;
  /** 当前屏幕是否达到显示断点要求 */
  isLargeScreen: Ref<boolean>;
  /** 当前是否因路由匹配被隐藏 */
  isRouteHidden: Ref<boolean>;
  /** 当前是否因未达滚动阈值被隐藏 */
  isScrollHidden: Ref<boolean>;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查路由路径是否匹配任一隐藏规则
 * 字符串模式会被转为 RegExp 后执行 test()
 *
 * @param path - 当前路由路径（如 "/posts/123"）
 * @param patterns - 隐藏规则列表
 * @returns 是否命中任一规则（true = 需要隐藏）
 */
const matchHideRoute = (path: string, patterns: HideRoutePattern[]): boolean => {
  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(path);
    }
    return new RegExp(pattern).test(path);
  });
};

/**
 * 检查路由是否在指定路由白名单中
 * 当 patterns 为空时返回 true（视为全局匹配）
 *
 * @param path - 当前路由路径
 * @param patterns - 路由模式列表
 * @returns 是否匹配
 */
const matchRoute = (path: string, patterns: HideRoutePattern[]): boolean => {
  if (patterns.length === 0) {
    return true;
  }
  return matchHideRoute(path, patterns);
};

/**
 * 从 scrollShow 规则数组中查找当前路由匹配的阈值
 * 按数组顺序遍历，先匹配优先；routes 为空的规则视为全局兜底
 *
 * @param currentPath - 当前路由路径
 * @param rules - 滚动显示规则数组
 * @returns 匹配到的阈值（undefined 表示无匹配规则，不隐藏）
 */
const findMatchedThreshold = (currentPath: string, rules: ScrollShowRule[]): number | undefined => {
  for (const rule of rules) {
    if (!rule.routes || rule.routes.length === 0) {
      return rule.threshold;
    }
    if (matchRoute(currentPath, rule.routes)) {
      return rule.threshold;
    }
  }
  return undefined;
};

// ============================================================================
// Live2D Composable 主逻辑
// ============================================================================

/**
 * Live2D 看板娘 composable
 *
 * 封装 oh-my-live2d 库，提供懒加载和智能显隐控制：
 * - **按需加载**：初始化时不加载模型资源，等所有显示条件首次满足才触发加载
 * - **多维度控制**：支持路由隐藏、滚动距离触发、屏幕断点三种独立条件
 * - **状态守卫**：shouldShow 无变化时跳过冗余的显隐操作
 * - **滚动防护**：滚动期间禁用菜单/状态栏鼠标事件，防止误触
 *
 * @returns Live2D 实例和控制方法
 *
 * @example
 * ```ts
 * const live2d = useLive2d();
 * await live2d.init({
 *   models: [{ path: "/models/miku" }],
 *   hideRoutes: ["^/about$"],
 *   scrollShow: [{ threshold: 300 }],
 * });
 * ```
 */
export const useLive2d = (): UseLive2dReturn => {
  // ---- 实例与加载状态 ----

  /** oh-my-live2d 实例（shallowRef 避免深层响应式开销） */
  const instance = shallowRef<Oml2d | null>(null);

  /** 模型是否已完成初始化加载 */
  const isInitialized = ref(false);

  /** 加载中的锁标志，防止并发重复加载 */
  const isLoading = ref(false);

  // ---- 显示条件状态 ----

  /** 因路由规则匹配而隐藏 */
  const isRouteHidden = ref(false);

  /** 因滚动距离未达标而隐藏 */
  const isScrollHidden = ref(false);

  // ---- 配置与断点 ----

  /** init 时缓存的配置，供懒加载时使用 */
  let cachedConfig: Live2dConfig | undefined;

  /**
   * 当前生效的最小屏幕断点
   * 默认 lg (1024px)，可通过 config.breakpoint 覆盖
   */
  const activeBreakpoint = ref<"sm" | "md" | "lg" | "xl" | "2xl">("lg");

  /** 收集所有需要清理的 watch 停止函数和事件监听器移除函数 */
  const disposables: Array<() => void> = [];

  /** VueUse 断点监听器 */
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536
  });

  /** 当前屏幕宽度是否满足显示断点要求 */
  const isLargeScreen = computed(() => breakpoints.greaterOrEqual(activeBreakpoint.value).value);

  // ---- 核心计算属性 ----

  /**
   * 综合判断当前是否应该显示 Live2D
   * 三个条件全部满足时为 true：
   * 1. 未被路由规则隐藏
   * 2. 未被滚动条件隐藏
   * 3. 屏幕宽度达到断点要求
   */
  const shouldShow = computed(
    () => !isRouteHidden.value && !isScrollHidden.value && isLargeScreen.value
  );

  // ---- 状态守卫变量 ----

  /**
   * 上一次 shouldShow 的值，用于 evaluateVisibility 的短路优化
   * 初始化为 shouldShow 首次计算的值
   * init() 中会重置为 null 以确保首次评估必定通过
   */
  let prevShouldShow = shouldShow.value;

  // ---- 模型加载 ----

  /**
   * 实际执行 Live2D 模型的动态导入与初始化
   * 采用 import() 懒加载策略，仅在所有显示条件满足时才引入 oh-my-live2d 库
   * 内置多重守卫防止重复加载
   */
  const loadModel = async (): Promise<void> => {
    if (
      isInitialized.value ||
      isLoading.value ||
      !cachedConfig ||
      document.querySelector("#oml2d-stage")
    ) {
      return;
    }

    isLoading.value = true;

    try {
      const { loadOml2d } = await import("oh-my-live2d");
      instance.value = loadOml2d({ models: cachedConfig.models });
      isInitialized.value = true;
    } catch (error) {
      console.error("[useLive2d] Failed to load oh-my-live2d:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // ---- 显隐决策引擎 ----

  /**
   * 根据 shouldShow 和模型加载状态，决定执行何种显隐操作
   *
   * 决策矩阵：
   * ┌─────────────┬──────────────┬─────────────────────────────────┐
   * │ shouldShow  │ isInitialized│ 执行动作                         │
   * ├─────────────┼──────────────┼─────────────────────────────────┤
   * │ false       │ true         │ 隐藏（stageSlideOut / 关闭状态栏）│
   * │ false       │ false        │ 无操作                           │
   * │ true        │ false        │ 加载模型（loadModel）             │
   * │ true        │ true         │ 显示（stageSlideIn / 打开状态栏） │
   * └─────────────┴──────────────┴─────────────────────────────────┘
   *
   * 同时考虑 localStorage 中的 OML2D_STATUS 状态：
   * - "sleep"：模型处于休眠态，仅操作状态栏（statusBarOpen/Close）
   * - 其他/不存在：模型处于活跃态，操作舞台（stageSlideIn/Out）
   */
  const evaluateVisibility = (): void => {
    const currentShouldShow = shouldShow.value;

    /** 状态未发生变化，跳过本次评估以避免冗余操作 */
    if (currentShouldShow === prevShouldShow) return;
    prevShouldShow = currentShouldShow;

    /** 从 localStorage 读取模型当前是休眠还是活跃状态 */
    const isSleep = localStorage.getItem("OML2D_STATUS") === "sleep";

    // ---- 应该隐藏 ----

    if (!currentShouldShow) {
      if (instance.value && isInitialized.value) {
        if (isSleep) {
          instance.value.statusBarClose();
        } else {
          instance.value.stageSlideOut().then(() => {
            localStorage.setItem("OML2D_STATUS", "active");
          });
        }
      }
      return;
    }

    // ---- 应该显示但尚未加载 → 触发懒加载 ----

    if (!isInitialized.value) {
      loadModel();
      return;
    }

    // ---- 已加载且应该显示 → 执行显示动画 ----

    if (instance.value) {
      if (isSleep) {
        instance.value.statusBarOpen();
      } else {
        instance.value.stageSlideIn();
      }
    }
  };

  // ---- 初始化 ----

  /**
   * 初始化 Live2D composable
   *
   * 本方法只做两件事：
   * 1. 缓存配置并预先同步初始化所有显示条件状态
   * 2. 注册各类事件监听器（路由变化、滚动、屏幕尺寸）
   *
   * 模型本身不会在此方法中加载，而是延迟到所有显示条件首次满足时
   * 由 evaluateVisibility() 触发 loadModel()
   *
   * @param config - Live2D 配置对象
   */
  const init = async (config: Live2dConfig): Promise<void> => {
    if (isInitialized.value || document.querySelector("#oml2d-stage")) {
      return;
    }

    const route = useRoute();

    /** 重置状态守卫为 null，确保 init 内首次 evaluateVisibility 必定通过 */
    prevShouldShow = null as unknown as boolean;

    /*
     * ════════════════════════════════════════════════════════════
     * 第一阶段：预先同步初始化所有显示条件状态
     * ════════════════════════════════════════════════════════════
     *
     * 必须在任何 watcher 注册之前完成，原因：
     * hideRoutes 的 watch(immediate:true) 会立即触发 evaluateVisibility，
     * 但此时 scrollShow 的 handleScroll 尚未执行，isScrollHidden 还是初始值 false，
     * 导致 shouldShow 被误判为 true 从而提前加载模型。
     *
     * 通过此处预初始化，确保三个条件变量在第一次 evaluateVisibility 时均已就绪。
     */

    if (config.hideRoutes?.length) {
      isRouteHidden.value = matchHideRoute(route.path, config.hideRoutes);
    }

    if (config.scrollShow?.length) {
      const matchedThreshold = findMatchedThreshold(route.path, config.scrollShow);
      if (matchedThreshold !== undefined) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        isScrollHidden.value = scrollY < matchedThreshold;
      }
    }

    /* ════════════════════════════════════════════════════════════ */

    /** 缓存配置供后续懒加载使用 */
    cachedConfig = config;

    /** 应用自定义屏幕断点配置 */
    if (config.breakpoint) {
      activeBreakpoint.value = config.breakpoint;
    }

    /*
     * ════════════════════════════════════════════════════════════
     * 第二阶段：注册事件监听器
     * ════════════════════════════════════════════════════════════
     */

    // ---- 路由监听：hideRules ----

    if (config.hideRoutes && config.hideRoutes.length > 0) {
      const checkRouteHide = (): void => {
        isRouteHidden.value = matchHideRoute(route.path, config.hideRoutes!);
        evaluateVisibility();
      };
      const stopRouteWatch = watch(() => route.path, checkRouteHide, { immediate: true });
      disposables.push(stopRouteWatch);
    }

    // ---- 滚动监听：scrollShow ----

    if (config.scrollShow && config.scrollShow.length > 0) {
      /*
       * 滚动交互控制：禁用 / 恢复 Live2D 元素的鼠标事件
       *
       * 设计为双通道架构：
       * - 即时通道（onScrollInteraction）：scroll 事件触发后立刻禁用 pointerEvents
       * - 延迟通道（debouncedEnableInteractions）：滚动停止 1s 后恢复 pointerEvents
       * 这样可以防止用户快速滚动时误触菜单按钮
       */

      const menusSelector = "#oml2d-menus";
      const statusBarSelector = "#oml2d-statusBar";

      /** 禁用菜单和状态栏的鼠标事件 */
      const disableInteractions = (): void => {
        const menus = document.getElementById(menusSelector);
        const statusBar = document.getElementById(statusBarSelector);
        if (menus) menus.style.pointerEvents = "none";
        if (statusBar) statusBar.style.pointerEvents = "none";
      };

      /** 恢复菜单和状态栏的鼠标事件（清除内联样式，回归 CSS 默认值） */
      const enableInteractions = (): void => {
        const menus = document.getElementById(menusSelector);
        const statusBar = document.getElementById(statusBarSelector);
        if (menus) menus.style.pointerEvents = "";
        if (statusBar) statusBar.style.pointerEvents = "";
      };

      /** 滚动停止 1s 后恢复交互的防抖函数（每次滚动重置计时器） */
      const debouncedEnableInteractions = useDebounceFn(enableInteractions, 1000);

      /**
       * 滚动处理核心逻辑（100ms 防抖）
       * 根据当前滚动位置与匹配阈值的比较结果更新 isScrollHidden，
       * 再触发 evaluateVisibility 决策是否需要加载/显示/隐藏模型
       */
      const handleScroll = (): void => {
        const threshold = findMatchedThreshold(route.path, config.scrollShow!);

        if (threshold === undefined) {
          isScrollHidden.value = false;
          evaluateVisibility();
          return;
        }

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        isScrollHidden.value = scrollY < threshold;
        evaluateVisibility();
      };

      /** 防抖版滚动处理器（100ms），用于显隐判断以避免高频触发 */
      const debouncedHandleScroll = useDebounceFn(handleScroll, 100);

      /**
       * 即时版滚动处理器（无防抖），专用于交互禁用/恢复
       * 与 debouncedHandleScroll 分离的原因：
       * 禁用操作必须在滚动开始时立即生效，不能有延迟
       */
      const onScrollInteraction = (): void => {
        disableInteractions();
        debouncedEnableInteractions();
      };

      /** 同步执行初始滚动检查（不走防抖，确保初始状态准确） */
      handleScroll();

      /** 注册两个独立的 scroll 监听器，各司其职 */
      window.addEventListener("scroll", onScrollInteraction, { passive: true });
      window.addEventListener("scroll", debouncedHandleScroll, { passive: true });

      /** 收集 scroll 事件监听器的移除函数 */
      disposables.push(
        () => window.removeEventListener("scroll", onScrollInteraction),
        () => window.removeEventListener("scroll", debouncedHandleScroll)
      );

      /**
       * 路由切换时的处理：
       * 重置 isScrollHidden 为 false（新页面默认不因滚动隐藏）
       * 同步重新检查滚动状态（不走防抖）
       */
      const stopRouteScrollWatch = watch(
        () => route.path,
        () => {
          isScrollHidden.value = false;
          handleScroll();
        }
      );
      disposables.push(stopRouteScrollWatch);
    }

    /*
     * 无任何显示限制条件（无 hideRoutes 且无 scrollShow）时，
     * 在 init 结束时直接触发一次 evaluateVisibility 尝试加载模型。
     * 有条件限制的情况下，加载时机完全由各监听器驱动。
     */
    if (!config.hideRoutes?.length && !config.scrollShow?.length) {
      evaluateVisibility();
    }
  };

  // ---- 公开 API ----

  /**
   * 手动显示 Live2D 模型
   * 若模型尚未加载则触发加载
   */
  const show = (): void => {
    if (!isInitialized.value) {
      loadModel();
      return;
    }
    instance.value?.stageSlideIn();
  };

  /** 手动隐藏 Live2D 模型 */
  const hide = (): void => {
    instance.value?.stageSlideOut();
  };

  /** 屏幕尺寸变化时重新评估显隐状态 */
  const stopBreakpointWatch = watch(isLargeScreen, evaluateVisibility);
  disposables.push(stopBreakpointWatch);

  /**
   * 清理所有注册的事件监听器和 watcher，并重置内部状态
   * 应在组件 onUnmounted 时调用，防止内存泄漏和卸载后的误触发
   */
  const cleanup = (): void => {
    /** 按注册顺序逆序执行所有清理函数 */
    for (const dispose of disposables) {
      dispose();
    }
    disposables.length = 0;

    /** 重置所有响应式状态到初始值 */
    isInitialized.value = false;
    isLoading.value = false;
    isRouteHidden.value = false;
    isScrollHidden.value = false;
    cachedConfig = undefined;
    prevShouldShow = null as unknown as boolean;

    /** 清除实例引用（不销毁 DOM，由 oh-my-live2d 自行管理） */
    instance.value = null;
  };

  /** 组件卸载时自动执行清理，无需外部手动调用 */
  onUnmounted(cleanup);

  return {
    instance,
    init,
    show,
    hide,
    cleanup,
    isLargeScreen,
    isRouteHidden,
    isScrollHidden
  };
};
