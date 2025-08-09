import type {
  ArticleComment,
  ArticleItem,
  GetListRequest,
  GetListResponse,
} from "#shared/types";

export interface CreateArticleCategoryRequest {
  parent_id?: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface UpdateArticleCategoryRequest
  extends CreateArticleCategoryRequest {
  id: number;
}

export interface PublishArticleRequest {
  note_id: number;
  title: string;
  category?: number;
  author?: string;
  abstract: string;
  tags?: string[];
  publish_time?: number;
  cover?: string[];
  pinned?: number;
  password?: string;
  enable_comments: boolean;
  enable_tipping: boolean;
  url?: string;
  url_access_only: boolean;
}

export interface UpdateArticleRequest {
  id: number;
  title: string;
  category?: number;
  author?: string;
  abstract: string;
  tags?: string[];
  publish_time?: number;
  cover?: string[];
  pinned?: number;
  password?: string;
  enable_comments: boolean;
  enable_tipping: boolean;
  url?: string;
  url_access_only: boolean;
}

export interface GetArticleListRequest extends GetListRequest {
  category?: number;
  tag?: string;
}

export interface GetArticleListResponse extends GetListResponse<ArticleItem> {
  category?: number;
  tag?: string;
}

export interface SearchArticleRequest extends GetListRequest {
  kw: string;
}

export interface CreateArticleCommentRequest {
  avatar?: string;
  article_id: number;
  nickname: string;
  email: string;
  website?: string;
  content: string;
  parent?: number;
  reply?: number;
}

export interface GetArticleCommentListRequest extends GetListRequest {
  article_id: number;
}

export interface GetAdminArticleCommentListRequest extends GetListRequest {}

export interface GetArticleCommentListResponse
  extends GetListResponse<ArticleComment> {}

export interface LikeResponse {
  like: number;
}

export interface UpdateArticleCommentContentRequest {
  id: number;
  content: string;
}
