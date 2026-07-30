import type { ScrollbarTheme } from "./theme";
import type { clsx } from "clsx";

export type TailwindClassValue = Parameters<typeof clsx>[0];

/** 各部件可被外部覆盖的 tailwind class（参考 collapsible-panel 的 Ui 模式） */
export type ScrollbarUi = Partial<Record<keyof typeof ScrollbarTheme, TailwindClassValue>>;

/** 自绘滑块主题色（运行时通过 CSS 变量注入，保留旧版 theme 入参形状以便逐步替换） */
export interface ScrollbarColorTheme {
  trackColor?: string;
  thumbColor?: string;
  thumbHoverColor?: string;
  thumbActiveColor?: string;
}

export type WheelDirection = "vertical" | "horizontal";

export type Direction = "vertical" | "horizontal";

/** 暴露给调用方的方法签名 */
export interface ScrollbarExposed {
  getScrollElement: () => HTMLDivElement | undefined;
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
}
