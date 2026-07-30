import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Direction, TailwindClassValue } from "./types";

/** 合并 tailwind class（参考 collapsible-panel 的 mergeTailwindClass） */
export const mergeScrollbarClass = (...classNames: TailwindClassValue[]): string =>
  twMerge(clsx(classNames));

// 滑块最小长度，避免内容极长时滑块缩成一条线
export const MIN_SIZE = 20;
// 滚轮量→初速度缩放：越小每格滑得越近
export const WHEEL_SPEED_FACTOR = 0.15;
// 每帧速度衰减：越小停得越快
export const WHEEL_FRICTION = 0.9;

// 轴向映射：统一竖向/横向的取数字段
export const BAR_MAP = {
  vertical: {
    offset: "offsetHeight",
    scroll: "scrollTop",
    scrollSize: "scrollHeight",
    size: "height",
    axis: "Y",
    client: "clientY",
    direction: "top"
  },
  horizontal: {
    offset: "offsetWidth",
    scroll: "scrollLeft",
    scrollSize: "scrollWidth",
    size: "width",
    axis: "X",
    client: "clientX",
    direction: "left"
  }
} as const;

// 滑块样式：长度用 px，位移用 transform 百分比（百分比相对滑块自身尺寸）
export const renderThumbStyle = (
  move: number,
  size: string,
  dir: Direction
): Record<string, string> => ({
  [BAR_MAP[dir].size]: size,
  transform: `translate${BAR_MAP[dir].axis}(${move}%)`
});

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
