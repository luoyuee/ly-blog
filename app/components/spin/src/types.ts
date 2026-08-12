import type { ComponentUI } from "@/utils/tw-merge";
import type { SpinTheme } from "./theme";
import type { VNode } from "vue";

/**
 * 可渲染内容类型。
 * - string：作为文本节点渲染
 * - VNode：直接渲染
 * - 函数：渲染函数，返回 VNode
 */
export type SpinRenderable = string | VNode | (() => VNode);

export type SpinUI = ComponentUI<typeof SpinTheme>;

export interface UseSpinOptions {
  /** 主提示文案。字符串走 text prop；VNode/渲染函数走 title 插槽 */
  text?: SpinRenderable;
  /** 次级文案。字符串走 description prop；VNode/渲染函数走 description 插槽 */
  description?: SpinRenderable;
  /** spinner 插槽内容，覆盖默认 mdi:loading 图标 */
  spinner?: SpinRenderable;
  /** 整块加载面板插槽内容，传入后忽略 spinner/title/description */
  panel?: SpinRenderable;
  /** 全屏模式下是否锁定页面滚动，默认 true */
  lockScroll?: boolean;
  /** 遮罩层层级，默认 40 */
  zIndex?: number;
  ui?: SpinUI;
}

export interface CreateSpinOptions extends UseSpinOptions {
  /**
   * 目标节点：HTMLElement 或选择器。
   * 传入则在目标节点上显示局部遮罩；不传则全屏遮罩。
   */
  target?: HTMLElement | string;
}

export interface SpinHandler {
  /** 关闭 loading */
  close: () => void;
  /** 更新主文案（字符串走 prop，VNode/渲染函数走 title 插槽） */
  setText: (text: SpinRenderable) => void;
  /** 更新次级文案（字符串走 prop，VNode/渲染函数走 description 插槽） */
  setDescription: (description: SpinRenderable) => void;
}
