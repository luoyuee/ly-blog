/**
 * 颜色转换工具函数
 */

/**
 * HSL 转 RGB，返回 0-255
 * @param h 色相 (0-360)
 * @param s 饱和度 (0-100)
 * @param l 亮度 (0-100)
 * @returns RGB 数组 [r, g, b]
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  // 标准化参数
  h = h % 360;
  if (h < 0) h += 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/**
 * RGB 转 HEX
 * @param r 红色 (0-255)
 * @param g 绿色 (0-255)
 * @param b 蓝色 (0-255)
 * @returns HEX 颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // 边界检查和取整处理
  const clamp = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

  const hexR = clamp(r).toString(16).padStart(2, "0");
  const hexG = clamp(g).toString(16).padStart(2, "0");
  const hexB = clamp(b).toString(16).padStart(2, "0");

  return `#${hexR}${hexG}${hexB}`;
}

/**
 * 计算 RGB 颜色的亮度
 * @param r 红色 (0-255)
 * @param g 绿色 (0-255)
 * @param b 蓝色 (0-255)
 * @returns 亮度值 (0-1)
 */
export function luminance(r: number, g: number, b: number): number {
  const sr = r / 255;
  const sg = g / 255;
  const sb = b / 255;
  const R = sr <= 0.03928 ? sr / 12.92 : Math.pow((sr + 0.055) / 1.055, 2.4);
  const G = sg <= 0.03928 ? sg / 12.92 : Math.pow((sg + 0.055) / 1.055, 2.4);
  const B = sb <= 0.03928 ? sb / 12.92 : Math.pow((sb + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * 根据亮度值选择合适的文本颜色
 * @param luminance 亮度值 (0-1)
 * @returns 文本颜色 HEX 字符串
 */
export function getTextColorByLuminance(luminance: number): string {
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * 根据文本内容生成背景色
 * @param text 文本内容
 * @param saturation 饱和度 (0-100)，默认65
 * @param lightness 亮度 (0-100)，默认55
 * @returns 背景色 HEX 字符串
 */
export function generateBgColorByText(
  text: string,
  saturation: number = 65,
  lightness: number = 55
): string {
  const firstChar = text.charCodeAt(0) || 65;
  const hue = (firstChar * 57) % 360;

  const rgb = hslToRgb(hue, saturation, lightness);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/**
 * 根据文本内容生成文本颜色
 * @param text 文本内容
 * @param saturation 饱和度 (0-100)，默认65
 * @param lightness 亮度 (0-100)，默认55
 * @returns 文本颜色 HEX 字符串
 */
export function generateTextColorByText(
  text: string,
  saturation: number = 65,
  lightness: number = 55
): string {
  const firstChar = text.charCodeAt(0) || 65;
  const hue = (firstChar * 57) % 360;

  const rgb = hslToRgb(hue, saturation, lightness);
  const lum = luminance(rgb[0], rgb[1], rgb[2]);
  return getTextColorByLuminance(lum);
}
