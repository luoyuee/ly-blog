import type { CollapsiblePanelTheme } from "./theme";
import type { clsx } from "clsx";

export type TailwindClassValue = Parameters<typeof clsx>[0];

export type CollapsiblePanelUi = Partial<
  Record<keyof typeof CollapsiblePanelTheme, TailwindClassValue>
>;

/** 折叠面板项配置 */
export interface CollapsiblePanelItem {
  /** 唯一标识 */
  value: string;
  /** 标题 */
  label: string;
  /** 前置图标 */
  icon?: string;
  /** 后置图标，默认 lucide:chevron-right */
  trailingIcon?: string;
  /** 纯文本内容（简单场景），优先级低于插槽 */
  content?: string;
  /** 自定义插槽名，触发 #xxx 插槽 */
  slot?: string;
  /** 禁用切换 */
  disabled?: boolean;
  /** 默认展开 */
  defaultOpen?: boolean;
  /** 是否可拖拽调整大小 */
  resizable?: boolean;
  /** 自定义 class（追加到面板头） */
  class?: string;
}

export type ModelValue = string | string[] | null;

export type PanelType = "single" | "multiple";

export interface PanelLayout {
  /** 顶部偏移（px） */
  top: number;
  /** 整体高度（含 header，px） */
  size: number;
  /** 内容区高度（px） */
  bodyHeight: number;
}
