import type { ArticleTOCItem } from "#shared/types";
import { toTree } from "@@/shared/utils/convert";

export function getEditorFilePath(options: { name: string; folder?: number | string }): string {
  if (options.folder) {
    return `/${options.folder}${options.name}`;
  } else {
    return `/${options.name}`;
  }
}

/**
 * 解析文章内容中的标题，生成文章目录（TOC）树形结构
 *
 * @param content - 文章内容，支持 Markdown 格式的标题（# ## ### 等）
 * @returns ArticleTOCItem[] - 目录项数组，包含层级关系和父子结构
 *
 * 功能说明：
 * 1. 使用正则表达式匹配 Markdown 标题（# ## ### 等）
 * 2. 提取标题级别（# 的数量）和标题文本
 * 3. 为每个标题分配唯一 ID
 * 4. 根据标题级别确定父子关系（子标题的 parent 指向最近的父级标题）
 * 5. 最后使用 toTree 函数将线性数组转换为树形结构
 *
 * 示例：
 * 输入："# 一级标题\n## 二级标题\n### 三级标题"
 * 输出：包含层级关系的树形目录结构
 */
export function getArticleTOC(content: string): ArticleTOCItem[] {
  // 匹配 Markdown 标题的优化正则表达式：^(#{1,6})\s+(.+?)\s*$
  // ^ 表示行首，(#{1,6}) 匹配1-6个#字符（Markdown最多6级标题）
  // \s+ 匹配一个或多个空白字符，(.+?) 非贪婪匹配标题文本
  // \s*$ 匹配标题后的可选空白字符直到行尾
  // 使用非贪婪匹配避免捕获过多内容，支持标题中包含特殊字符
  const regex = /^(#{1,6})\s(.+)/gm;
  let match;
  const toc: ArticleTOCItem[] = [];
  let index = 1; // 为每个标题分配唯一 ID

  // 遍历所有匹配的标题
  while ((match = regex.exec(content)) !== null) {
    const level = match[1]?.length ?? 0; // 标题级别（# 的数量），防止 match[1] 为 undefined
    const title = match[2]?.trim() ?? ""; // 标题文本（去除首尾空白），防止 match[2] 为 undefined

    // 一级标题没有父级，直接添加到数组
    if (level === 1) {
      toc.push({ id: index, title, level });
    } else {
      // 非一级标题需要找到合适的父级
      const current: ArticleTOCItem = { id: index, title, level };

      // 向前查找比当前标题级别小的标题作为父级
      // 从当前位置的前一个开始向前查找（index - 2 是因为数组索引从 0 开始）
      for (let i = index - 2; i >= 0; i--) {
        if (toc[i].level < current.level) {
          current.parent = toc[i].id; // 找到父级，设置 parent 属性
          break;
        }
      }
      toc.push(current);
    }

    index++; // 递增 ID
  }

  // 使用 toTree 工具函数将线性数组转换为树形结构
  // 该函数会根据 parent 字段自动构建 children 数组
  return toTree(toc);
}
