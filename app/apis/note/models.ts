import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { ArticleItem } from "#shared/types/article";

export interface GetFolderTreeRequest {
  "include-file": boolean;
}

export interface CreateFolderRequest {
  parent_id?: number;
  name: string;
}

export interface RenameFolderRequest {
  id: number;
  parent?: number;
  name: string;
}

export interface MoveFolderRequest {
  id: number;
  parent?: number;
  isFolder?: boolean;
}

export type GetArticlePaginatedRequest = GetPaginatedRequest;

export type GetArticlePaginatedResponse = GetPaginatedResponse<ArticleItem>;

export interface CreateNoteRequest {
  name: string;
  folder_id?: number;
  content: string;
  extension?: string;
}

export interface UpdateNoteRequest extends CreateNoteRequest {
  id: number;
}

export interface UpdateNoteContentRequest {
  id: number;
  content: string;
}

export interface RenameNoteRequest {
  id: number;
  name: string;
}
