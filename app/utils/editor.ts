import type { ArticleTOCItem } from "#shared/types";
import { toTree } from "./index";

export function getEditorFilePath(options: {
  filename: string;
  folder?: number | string;
}): string {
  if (options.folder) {
    return `/${options.folder}${options.filename}`;
  } else {
    return `/${options.filename}`;
  }
}

export function getArticleTOC(content: string): ArticleTOCItem[] {
  const regex = /^(#+)\s(.+)/gm;
  let match;
  let toc: ArticleTOCItem[] = [];
  let index = 1;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].replaceAll(" ", "");

    if (level === 1) {
      toc.push({ id: index, title, level });
    } else {
      let current: ArticleTOCItem = { id: index, title, level };
      for (let i = index - 2; i >= 0; i--) {
        if (toc[i].level < current.level) {
          current.parent = toc[i].id;
          break;
        }
      }
      toc.push(current);
    }

    index++;
  }

  return toTree(toc);
}
