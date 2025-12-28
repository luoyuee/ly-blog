import type { Ref } from "vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

/**
 * 宽度断点配置
 * 当容器宽度大于等于 minWidth 时，使用对应的 columns 列数
 */
interface WaterfallBreakpoint {
  minWidth: number;
  columns: number;
}

/**
 * 瀑布流配置项
 */
interface WaterfallOptions {
  /**
   * 列之间的水平间距（单位：px）
   */
  columnGap?: number;
  /**
   * 行之间的垂直间距（单位：px）
   */
  rowGap?: number;
  /**
   * 没有断点时默认使用的列数
   */
  defaultColumns?: number;
  /**
   * 宽度断点配置，存在时优先于 minColumnWidth 逻辑
   */
  breakpoints?: WaterfallBreakpoint[];
}

/**
 * useWaterfall 返回结果
 */
interface UseWaterfallResult {
  /**
   * 手动触发一次重新布局
   */
  relayout: () => void;
  /**
   * 是否已经完成首屏布局，用于控制容器显示/隐藏
   */
  isReady: Ref<boolean>;
}

/**
 * 瀑布流布局 hook
 *
 * 功能：
 * - 根据容器宽度和断点，自动计算列数
 * - 使用 absolute + transform 实现瀑布流布局
 * - 监听容器和子元素尺寸变化自动重排
 * - 监听子元素新增 / 删除自动重排
 *
 * @param containerRef 父级容器元素的 ref，由调用处传入
 * @param options 瀑布流配置项
 */
export const useWaterfall = (
  containerRef: Ref<HTMLElement | null>,
  options: WaterfallOptions = {}
): UseWaterfallResult => {
  const { columnGap = 16, rowGap = 16, breakpoints, defaultColumns = 2 } = options;

  /**
   * 统一的 ResizeObserver，用来监听容器和子元素尺寸变化
   */
  let resizeObserver: ResizeObserver | null = null;

  /**
   * 监听子元素新增 / 删除
   */
  let mutationObserver: MutationObserver | null = null;

  /**
   * requestAnimationFrame id，用来防抖布局
   */
  let layoutRafId: number | null = null;

  /**
   * 首屏布局完成标记，用于控制容器可见性
   */
  const isReady = ref(false);

  /**
   * 窗口大小变化时的回调
   */
  const handleWindowResize = (): void => {
    scheduleLayout();
  };

  /**
   * 取消已经调度的布局
   */
  const cancelScheduledLayout = (): void => {
    if (layoutRafId === null) {
      return;
    }
    window.cancelAnimationFrame(layoutRafId);
    layoutRafId = null;
  };

  /**
   * 在下一帧调度一次布局，避免频繁同步计算
   */
  const scheduleLayout = (): void => {
    cancelScheduledLayout();
    layoutRafId = window.requestAnimationFrame(() => {
      layoutRafId = null;
      doLayout();
    });
  };

  /**
   * 根据断点配置和容器宽度计算列数
   * breakpoints 存在时优先使用断点逻辑，否则回退到默认列数
   */
  const resolveColumnCount = (containerWidth: number): number => {
    if (breakpoints && breakpoints.length > 0) {
      /**
       * 按 minWidth 从大到小排序，优先匹配较大的断点
       */
      const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);
      const match = sorted.find((item) => containerWidth >= item.minWidth);

      if (match && match.columns > 0) {
        return match.columns;
      }

      return 1;
    }

    /**
     * 没有断点时，使用默认列数（至少 1 列）
     */
    return defaultColumns > 0 ? defaultColumns : 1;
  };

  /**
   * 执行一次实际的瀑布流布局
   */
  const doLayout = (): void => {
    const container = containerRef.value;
    if (!container) return;

    /**
     * 只处理 HTMLElement 子节点
     */
    const children = Array.from(container.children).filter(
      (node) => node instanceof HTMLElement
    ) as HTMLElement[];

    if (children.length === 0) {
      container.style.height = "0px";
      return;
    }

    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;

    const columnCount = resolveColumnCount(containerWidth);

    /**
     * 计算列宽和列间距总宽
     */
    const totalGapWidth = columnGap * (columnCount - 1);
    const columnWidth = (containerWidth - totalGapWidth) / columnCount;

    /**
     * 每一列当前累积高度数组
     */
    const columnHeights: number[] = new Array(columnCount).fill(0);

    /**
     * 使用相对定位作为绝对定位子元素的参考
     */
    container.style.position = "relative";

    for (const child of children) {
      const style = child.style;

      /**
       * 统一设置子元素为绝对定位并指定列宽
       */
      style.position = "absolute";
      style.width = `${columnWidth}px`;

      /**
       * 先重置 top/left，避免历史样式干扰
       */
      style.top = "0px";
      style.left = "0px";

      /**
       * 找到当前高度最小的列，把元素放在这列下面
       */
      const minHeight = Math.min(...columnHeights);
      const targetColumnIndex = columnHeights.indexOf(minHeight);

      const top = columnHeights[targetColumnIndex] as number;
      const left = targetColumnIndex * (columnWidth + columnGap);

      /**
       * 使用 transform 进行位移，避免频繁写 top/left 带来的重排
       */
      style.transform = `translate(${left}px, ${top}px)`;

      /**
       * offsetHeight 在 transform 后依然是元素真实高度
       */
      const height = child.offsetHeight;
      const nextHeight = top + height + rowGap;
      columnHeights[targetColumnIndex] = nextHeight;
    }

    /**
     * 容器高度等于所有列中最高的一个，最后一行不需要多加 rowGap
     */
    const maxHeight = Math.max(...columnHeights);
    const finalHeight = maxHeight - rowGap;
    container.style.height = `${finalHeight <= 0 ? 0 : finalHeight}px`;

    /**
     * 首次布局完成后标记为就绪，供外部控制可见性
     */
    if (!isReady.value) {
      isReady.value = true;
    }
  };

  /**
   * 初始化 ResizeObserver 和 MutationObserver
   */
  const setupObservers = (): void => {
    const container = containerRef.value;
    if (!container) return;

    /**
     * 初始化 ResizeObserver：监听容器和每个子元素
     */
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        scheduleLayout();
      });
    }

    resizeObserver.observe(container);

    const children = Array.from(container.children).filter(
      (node) => node instanceof HTMLElement
    ) as HTMLElement[];

    for (const child of children) {
      resizeObserver.observe(child);
    }

    /**
     * 初始化 MutationObserver：监听子元素的新增 / 删除
     */
    if (!mutationObserver) {
      mutationObserver = new MutationObserver((mutations) => {
        const currentObserver = resizeObserver;
        if (!currentObserver) return;

        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              currentObserver.observe(node);
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              currentObserver.unobserve(node);
            }
          });
        }

        scheduleLayout();
      });
    }

    mutationObserver.observe(container, {
      childList: true,
      subtree: false
    });
  };

  /**
   * 销毁所有监听器，避免内存泄漏
   */
  const cleanupObservers = (): void => {
    cancelScheduledLayout();

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  };

  /**
   * 组件挂载时开始监听
   */
  onMounted(() => {
    /**
     * 初次挂载时也需要执行一次布局
     */
    scheduleLayout();
    setupObservers();
    window.addEventListener("resize", handleWindowResize);
  });

  /**
   * 组件卸载时清理监听
   */
  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleWindowResize);
    cleanupObservers();
  });

  /**
   * 当容器 ref 发生变化时，重新绑定监听
   */
  watch(containerRef, () => {
    cleanupObservers();
    setupObservers();
  });

  /**
   * 暴露给外部手动触发布局的函数
   */
  const relayout = (): void => {
    scheduleLayout();
  };

  return {
    relayout,
    isReady
  };
};
