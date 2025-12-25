import type { FolderTreeItem } from "#shared/types/mdc-editor";
import type {
  CreateFolderRequest,
  GetFolderTreeRequest,
  RenameFolderRequest,
  MoveFolderRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
  RenameNoteRequest
} from "./models";
import { serviceAxios } from "@/utils/request";

/**
 * 获取目录树
 */
export async function getFolderTree(params?: GetFolderTreeRequest): Promise<FolderTreeItem[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/note/folder/tree",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 创建目录
export async function createFolder(data: CreateFolderRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/note/folder",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 重命名
export async function renameFolder(data: RenameFolderRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/note/folder/rename",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 移动文件夹
export async function moveFolder(data: MoveFolderRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/note/folder/move",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 删除目录
export async function deleteFolder(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/note/folder/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 创建笔记
export async function createNote(data: CreateNoteRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/note",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 更新笔记
export async function updateNote(data: UpdateNoteRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/note",
      method: "put",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 发布文章
export async function releaseArticle(data: any): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/note",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 重命名笔记
export async function renameNote(data: RenameNoteRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/note/rename",
      method: "put",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取笔记详情
export async function getNoteDetail(id: number): Promise<Note> {
  try {
    const response = await serviceAxios({
      url: "/admin/note/detail/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
