import { TagColors } from "#shared/constants";

/**
 * 根据标签名称生成确定性颜色
 * @param tag 标签名称
 * @param colors 可选的颜色数组，默认使用 TagColors
 * @returns 返回根据标签名称计算出的颜色
 */
export const getColorForTag = (tag: string, colors: string[] = TagColors): string => {
  // 使用标签名称生成一个确定性的索引，确保SSR和客户端渲染结果一致
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index] ?? "#6fa3ef";
};

/**
 * 生成随机颜色（仅用于非SSR场景）
 * @param colors 可选的颜色数组，默认使用 TagColors
 * @returns 返回随机选择的颜色
 */
export const getRandomColor = (colors: string[] = TagColors): string => {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index] ?? "#6fa3ef";
};
