import { AuditTrailKeys } from "./common";

export interface ArticleCategoryItem {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  parent_id?: number;
  icon?: string;
  name: string;
  description?: string;
  count?: number;
}

export type ArticleCategoryForm = Partial<
  Omit<ArticleCategoryItem, AuditTrailKeys | "count">
> & {};

export type ArticleCategorySelectOption = Pick<
  ArticleCategoryItem,
  "id" | "icon" | "name" | "description"
>;

export interface ArticleDetail {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  content_updated_at: number;
  note_id: number;
  publish_time?: number;
  category?: number;
  title: string;
  abstract: string;
  content: string;
  words: number;
  tags?: string[];
  author: string;
  cover?: string[];
  pinned?: number;
  password?: string;
  enable_comments: boolean;
  enable_tipping: boolean;
  url?: string;
  url_access_only: boolean;
  toc: ArticleTOCItem[];
  views_count: number;
  comments_count: number;
  likes_count: number;
}

export type ArticleItem = Omit<ArticleDetail, "content">;
