import type { ModelValue, PanelType, TailwindClassValue } from "./types";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export const mergeTailwindClass = (...classNames: TailwindClassValue[]): string => {
  return twMerge(clsx(classNames));
};

export const HEADER_HEIGHT = 32;
export const DEFAULT_TRAILING_ICON = "lucide:chevron-right";

const isArrayValue = (value: ModelValue): value is string[] => Array.isArray(value);

export const normalizeOpenKeys = (value: ModelValue, type: PanelType): string[] => {
  if (isArrayValue(value)) {
    const filtered = value.filter((item) => typeof item === "string" && item.length > 0);
    return type === "multiple" ? filtered : filtered.slice(0, 1);
  }
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return [];
};

export const toEmitValue = (keys: string[], type: PanelType): string | string[] | null => {
  if (type === "multiple") {
    return [...keys];
  }
  return keys[0] ?? null;
};

export const isSameKeys = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
