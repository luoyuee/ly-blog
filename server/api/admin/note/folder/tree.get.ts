import type { FolderTreeItem } from "#shared/types/mdc-editor";
import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { getQuery } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

type ArticleItem = {
  id: number;
  note_id: number;
};

async function getFolders(): Promise<FolderTreeItem[]> {
  const data = await prisma.noteFolder.findMany({ where: { status: 1 } });

  return data.map((item) => ({
    key: `folder-${item.id}`,
    id: item.id,
    parent_id: item.parent_id ?? undefined,
    created_at: item.created_at ? Math.floor(item.created_at.getTime() / 1000) : undefined,
    updated_at: item.updated_at ? Math.floor(item.updated_at.getTime() / 1000) : undefined,
    name: item.name,
    is_folder: true,
    type: "folder",
    data: {}
  }));
}

async function getNotes(): Promise<FolderTreeItem[]> {
  const data = await prisma.note.findMany({ where: { status: 1 } });

  return data.map((item) => ({
    key: `${item.extension}-${item.id}`,
    id: item.id,
    parent_id: item.folder_id ?? undefined,
    created_at: item.created_at ? Math.floor(item.created_at.getTime() / 1000) : undefined,
    updated_at: item.updated_at ? Math.floor(item.updated_at.getTime() / 1000) : undefined,
    name: item.name,
    type: "note",
    data: {
      is_published: false,
      extension: item.extension
    }
  }));
}

async function getArticles(): Promise<ArticleItem[]> {
  const data = await prisma.article.findMany({
    where: { status: 1 },
    select: {
      id: true,
      note_id: true
    }
  });

  return data;
}

function toTree(
  folders: FolderTreeItem[],
  notes: FolderTreeItem[],
  articles: ArticleItem[]
): FolderTreeItem[] {
  const folderMap: Record<number, FolderTreeItem> = {};
  const articleMap: Record<number, number> = {};

  folders.forEach((item) => {
    folderMap[item.id] = item;
  });

  articles.forEach((item) => {
    articleMap[item.note_id] = item.id;
  });

  const rootFiles: FolderTreeItem[] = [];

  notes.forEach((item) => {
    if (item.type === "note" && articleMap[item.id]) {
      item.data.is_published = true;
      item.data.article_id = articleMap[item.id];
    }

    const parent = item.parent_id ? folderMap[item.parent_id] : undefined;

    if (parent) {
      if (parent.children) {
        parent.children.push(item);
      } else {
        parent.children = [item];
      }
    } else {
      rootFiles.push(item);
    }
  });

  const tree: FolderTreeItem[] = [];

  folders.forEach((item) => {
    const parent = item.parent_id ? folderMap[item.parent_id] : undefined;

    if (parent) {
      if (parent.children) {
        parent.children.push(item);
      } else {
        parent.children = [item];
      }
    } else {
      tree.push(item);
    }
  });

  return tree.concat(rootFiles);
}

export default defineEventHandler(async (event) => {
  const schema = z.object({
    "include-file": z.coerce.boolean().optional()
  });
  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  let notes: FolderTreeItem[] = [];
  let articls: ArticleItem[] = [];

  if (params["include-file"]) {
    notes = await getNotes();
    articls = await getArticles();
  }

  const folders = await getFolders();

  return getOKResponse(event, toTree(folders, notes, articls));
});
