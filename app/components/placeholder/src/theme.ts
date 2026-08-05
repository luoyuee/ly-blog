import type { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { clsx as clsxFn } from "clsx";

export type TailwindClassValue = Parameters<typeof clsx>[0];

/**
 * Placeholder 组件主题样式定义。
 * 与 Nuxt UI 官方主题系统一致：所有内部样式集中于此，
 * 外部可通过 `ui` prop 传入同名 key 进行覆写。
 */
export const PlaceholderTheme = {
  /** 最外层容器：定位、溢出、圆角、虚线边框、透明度 */
  container:
    "relative overflow-hidden rounded-sm border border-dashed border-accented opacity-75 px-4 flex items-center justify-center",
  /** 斜纹背景 svg：绝对铺满 */
  pattern: "absolute inset-0 size-full stroke-inverted/10",
  /** 内容层：绝对铺满、居中、纵向排列；无插槽时不渲染 */
  content: "absolute size-full flex flex-col items-center justify-center gap-3"
} as const;

/**
 * Placeholder 的 `ui` prop 类型。
 * 与 Nuxt UI 主题系统一致：外部可传入与 theme 同名的 key 进行覆写，
 * 缺省字段会保留内部默认值。
 */
export type PlaceholderUi = Partial<Record<keyof typeof PlaceholderTheme, TailwindClassValue>>;

/**
 * 合并 Tailwind 类名：默认值在前、外部传入值在后，twMerge 去重并处理冲突。
 * 与 Nuxt UI 官方主题系统的 `ui` 覆写行为保持一致。
 */
export const mergeTailwindClass = (...classNames: TailwindClassValue[]): string => {
  return twMerge(clsxFn(classNames));
};

export default PlaceholderTheme;
