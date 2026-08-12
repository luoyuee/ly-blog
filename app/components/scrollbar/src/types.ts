import type { ComponentUI } from "@/utils/tw-merge";
import type { ScrollbarTheme } from "./theme";

export type ScrollbarUI = ComponentUI<typeof ScrollbarTheme>;

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
