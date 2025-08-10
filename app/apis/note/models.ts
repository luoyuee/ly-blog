import type { ArticleItem, GetListRequest, GetListResponse } from "#shared/types";

export interface GetFolderTreeRequest {
  "include-file": boolean;
}

export interface CreateFolderRequest {
  parent?: number;
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

export interface GetArticleRequest extends GetListRequest {}

export interface GetArticleResponse extends GetListResponse<ArticleItem> {}

export interface CreateNoteRequest {
  name: string;
  folder_id?: number;
  content: string;
  extension?: string;
}

export interface UpdateNoteRequest extends CreateNoteRequest {
  id: number;
}

export interface RenameNoteRequest {
  id: number;
  name: string;
}
