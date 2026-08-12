import { clsx } from "clsx";
import { twMerge as twMergeCore } from "tailwind-merge";

/**
 * 可传给 twMerge 的类名值：支持字符串 / 条件对象 / 嵌套数组等 clsx 接受的形态。
 */
export type TailwindClassValue = Parameters<typeof clsx>[0];

/**
 * 合并 tailwind class。
 *
 * 使用 clsx 整理条件类名，再用 tailwind-merge 处理冲突类，
 * 确保调用方传入同类工具类时能覆盖默认值。
 */
export const twMerge = (...classNames: TailwindClassValue[]): string =>
  twMergeCore(clsx(classNames));

/**
 * 根据 theme 字典生成对应组件的 UI 覆盖类型。
 * 每个 key 均可被外部以 tailwind class 覆盖。
 */
export type ComponentUI<T extends Record<string, unknown>> = Partial<
  Record<keyof T, TailwindClassValue>
>;
