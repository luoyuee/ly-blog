/**
 * 图片文件夹类型枚举
 * @description 定义系统中的图片文件夹分类
 */
export const ImageFolderEnum = {
  /** 系统图片 */
  SYSTEM: 1,
  /** 背景图片 */
  BACKGROUND: 2,
  /** 文章图片 */
  ARTICLE: 3
} as const;

/** 图片文件夹类型 */
export type ImageFolder = (typeof ImageFolderEnum)[keyof typeof ImageFolderEnum];
