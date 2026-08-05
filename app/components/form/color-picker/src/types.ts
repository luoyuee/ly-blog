/**
 * 预设颜色选项
 */
export interface PresetColorOption {
  /** 颜色值，支持任意合法 CSS 颜色 */
  value: string;
  /** 可选颜色名称 */
  label?: string;
}

/** 色块形状预设 */
export type PresetColorShape = "circle" | "rounded";
