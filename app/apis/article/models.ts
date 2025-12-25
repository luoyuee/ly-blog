import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { ArticleForm, ArticleComment, Article } from "#shared/types/article";

export interface CreateArticleCategoryRequest {
  parent_id?: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface UpdateArticleCategoryRequest extends CreateArticleCategoryRequest {
  id: number;
}

export type PublishArticleRequest = ArticleForm;

export type UpdateArticleRequest = Pick<
  Article,
  | "id"
  | "title"
  | "category_id"
  | "author"
  | "abstract"
  | "tags"
  | "published_at"
  | "cover"
  | "password"
  | "allow_comments"
  | "allow_rewards"
  | "pin_priority"
  | "custom_url"
  | "custom_url_access_only"
>;

export interface GetArticlePaginatedRequest extends GetPaginatedRequest {
  category?: number;
  tag?: string;
}

export interface GetArticlePaginatedResponse extends GetPaginatedResponse<ArticleItem> {
  category?: number;
  tag?: string;
}

export interface SearchArticleRequest extends GetPaginatedRequest {
  kw: string;
}

export interface CreateArticleCommentRequest {
  article_id: number;
  avatar?: string;
  nickname: string;
  email: string;
  website?: string;
  content: string;
  parent_id?: number;
  reply_id?: number;
}

export interface GetArticleCommentListRequest extends GetPaginatedRequest {
  article_id: number;
}

export type GetAdminArticleCommentListRequest = GetPaginatedRequest;

export type GetArticleCommentListResponse = GetPaginatedResponse<ArticleComment>;

export interface LikeResponse {
  like_count: number;
}

export interface UpdateArticleCommentContentRequest {
  id: number;
  content: string;
}
