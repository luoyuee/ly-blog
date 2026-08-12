import type { CreateSpinOptions, SpinHandler, SpinRenderable } from "./types";
import type { SpinContext } from "./instance";
import type { AppContext, VNode } from "vue";
import { createVNode, defineComponent, h, reactive, render } from "vue";
import { createLogger } from "@/utils/logger";
import { instances } from "./instance";
import Spin from "./Spin.vue";

const logger = createLogger("useSpin");

let _appContext: AppContext | null = null;

export const setSpinAppContext = (ctx: AppContext) => {
  _appContext = ctx;
};

let seed = 1;

/** Spin 的 Transition duration，关闭后等待动画结束再卸载 */
const TRANSITION_DURATION = 200;

const resolveTarget = (target?: HTMLElement | string): HTMLElement | null => {
  if (!target) return null;

  if (typeof target === "string") {
    const matched = document.querySelector<HTMLElement>(target);
    if (!matched) {
      logger.warn(`未找到选择器 "${target}" 对应的节点，将使用全屏遮罩`);
    }
    return matched;
  }

  return target;
};

/** 将渲染内容归一化为插槽函数 */
const toSlotFn = (content: SpinRenderable): (() => VNode) => {
  if (typeof content === "function") return content as () => VNode;
  if (typeof content === "string") return () => h("span", {}, content);
  return () => content;
};

export const createSpin = (options: CreateSpinOptions = {}): SpinHandler => {
  const id = `spin_${seed++}`;
  const target = resolveTarget(options.target);
  const fullscreen = !target;

  const state = reactive({
    loading: true,
    fullscreen,
    lockScroll: options.lockScroll ?? true,
    text: options.text,
    description: options.description,
    spinner: options.spinner,
    panel: options.panel,
    zIndex: options.zIndex ?? 40,
    ui: options.ui ?? {}
  });

  /**
   * 根据 state 构建 Spin 的 props 与 slots。
   * - text/description 为字符串时进 prop，为 VNode/渲染函数时进同名插槽
   * - spinner/panel 始终进对应插槽
   */
  const buildSpinRenderInput = () => {
    const spinProps: Record<string, unknown> = {
      loading: state.loading,
      fullscreen: state.fullscreen,
      lockScroll: state.lockScroll,
      zIndex: state.zIndex,
      ui: state.ui
    };

    // text：string → prop；VNode/fn → title 插槽（prop 置空避免双重显示）；undefined → 默认文案
    if (typeof state.text === "string") {
      spinProps.text = state.text;
    } else if (state.text) {
      spinProps.text = "";
    } else {
      spinProps.text = "加载中...";
    }

    // description：string → prop；VNode/fn → description 插槽；否则空
    if (typeof state.description === "string") {
      spinProps.description = state.description;
    } else {
      spinProps.description = "";
    }

    const slots: Record<string, () => VNode | VNode[]> = {};
    if (state.panel) slots.panel = toSlotFn(state.panel);
    if (state.spinner) slots.spinner = toSlotFn(state.spinner);
    if (state.text && typeof state.text !== "string") {
      slots.title = toSlotFn(state.text);
    }
    if (state.description && typeof state.description !== "string") {
      slots.description = toSlotFn(state.description);
    }

    return { spinProps, slots };
  };

  // 包裹一层组件，让 state 的响应式变化能驱动 Spin 的 props/slots 更新
  const Wrapper = defineComponent({
    name: "SpinWrapper",
    setup() {
      return () => {
        const { spinProps, slots } = buildSpinRenderInput();
        return h(Spin, spinProps, slots);
      };
    }
  });

  const container = document.createElement("div");
  const vnode = createVNode(Wrapper);
  if (_appContext) vnode.appContext = _appContext;
  render(vnode, container);

  // 局部模式：target 若 position:static 则临时改 relative，关闭后还原
  let originalPosition: string | null | undefined;
  if (target) {
    const computedPosition = window.getComputedStyle(target).position;
    if (computedPosition === "static") {
      originalPosition = target.style.position || null;
      target.style.position = "relative";
    }
    target.appendChild(container);
  } else {
    document.body.appendChild(container);
  }

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;

    // 触发 leave transition
    state.loading = false;

    window.setTimeout(() => {
      render(null, container);
      container.remove();

      if (target && originalPosition !== undefined) {
        target.style.position = originalPosition ?? "";
      }

      const idx = instances.findIndex((item) => item.id === id);
      if (idx !== -1) instances.splice(idx, 1);
    }, TRANSITION_DURATION);
  };

  const setText = (text: SpinRenderable) => {
    state.text = text;
  };

  const setDescription = (description: SpinRenderable) => {
    state.description = description;
  };

  const handler: SpinHandler = { close, setText, setDescription };

  const ctx: SpinContext = { id, vnode, handler };
  instances.push(ctx);

  return handler;
};

export const closeAllSpin = () => {
  const toClose = [...instances];
  for (const instance of toClose) {
    instance.handler.close();
  }
};
