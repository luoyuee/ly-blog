import type { FolderTreeItem } from "#shared/types/ly-editor";
import type {
  CreateFolderRequest,
  GetFolderTreeRequest,
  RenameFolderRequest,
  MoveFolderRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
  RenameNoteRequest,
  UpdateNoteContentRequest
} from "./models";
import request from "@/utils/request";

/**
 * 获取目录树
 */
export const getFolderTree = (params?: GetFolderTreeRequest): Promise<FolderTreeItem[]> => {
  return request({
    url: "/admin/note/folder/tree",
    method: "get",
    params
  });
};

// 创建目录
export const createFolder = (data: CreateFolderRequest): Promise<void> => {
  return request({
    url: "/admin/note/folder",
    method: "post",
    data
  });
};

// 重命名
export const renameFolder = (data: RenameFolderRequest): Promise<void> => {
  return request({
    url: "/admin/note/folder/rename",
    method: "put",
    data
  });
};

// 移动文件夹
export const moveFolder = (data: MoveFolderRequest): Promise<void> => {
  return request({
    url: "/admin/note/folder/move",
    method: "put",
    data
  });
};

// 删除目录
export const deleteFolder = (id: number): Promise<void> => {
  return request({
    url: "/admin/note/folder/" + id,
    method: "delete"
  });
};

// 创建笔记
export const createNote = (data: CreateNoteRequest): Promise<void> => {
  return request({
    url: "/admin/note",
    method: "post",
    data
  });
};

// 更新笔记
export const updateNote = (data: UpdateNoteRequest): Promise<void> => {
  return request({
    url: "/admin/note",
    method: "put",
    data
  });
};

// 更新笔记内容
export const updateNoteContent = (data: UpdateNoteContentRequest): Promise<void> => {
  return request({
    url: "/admin/note/content",
    method: "patch",
    data
  });
};

// 发布文章
export const releaseArticle = (data: any): Promise<void> => {
  return request({
    url: "/admin/note",
    method: "post",
    data
  });
};

// 重命名笔记
export const renameNote = (data: RenameNoteRequest): Promise<void> => {
  return request({
    url: "/admin/note/rename",
    method: "put",
    data
  });
};

// 获取笔记详情
export const getNoteDetail = (id: number): Promise<Note> => {
  return request({
    url: "/admin/note/detail/" + id,
    method: "get"
  });
};
