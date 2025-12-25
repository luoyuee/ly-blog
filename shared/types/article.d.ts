import type { AuditTrailKeys } from "./common";
import type { TocLink } from "@nuxtjs/mdc";

export interface ArticleCategory {
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

export type ArticleCategoryForm = Partial<Omit<ArticleCategory, AuditTrailKeys | "count">> & {};

export type ArticleCategoryOption = Pick<
  ArticleCategory,
  "id" | "parent_id" | "icon" | "name" | "description"
>;

export interface ArticleCategoryTreeItem extends ArticleCategory {
  children?: ArticleCategoryTreeItem[];
}

export type ArticleCategoryTree = ArticleCategoryTreeItem[];

export type ArticleTOCItem = TocLink;

export interface Article {
  id: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  note_id: number;
  note_version: number;
  extension: string;
  published_at?: string;
  category_id?: number;
  title: string;
  abstract: string;
  content: string;
  content_updated_at?: string;
  chars: number;
  tags?: string[];
  author: string;
  cover?: string[];
  pin_priority?: number;
  password?: string;
  allow_comments: boolean;
  allow_rewards: boolean;
  custom_url?: string;
  custom_url_access_only: boolean;
  toc?: ArticleTOCItem[];
  view_count: number;
  like_count: number;
  comment_count: number;
  locked?: boolean;
  status?: number;

  readonly category_name?: string;
  readonly category_levels?: Pick<ArticleCategory, "id" | "parent_id" | "name" | "icon">[];
  readonly category_icon?: string;
}

export type ArticleItem = Omit<ArticleDetail, "content">;

export type ArticleForm = Partial<
  Omit<
    Article,
    | AuditTrailKeys
    | "content_updated_at"
    | "toc"
    | "view_count"
    | "like_count"
    | "comment_count"
    | "status"
  >
> & {};

export interface ArticleComment {
  id: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  article_id: number;
  email: string;
  website?: string;
  avatar?: string;
  nickname: string;
  content: string;
  parent_id?: number;
  reply_id?: number;
  reply_nickname?: string;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
  role: number;
  status?: number;
  children?: ArticleComment[];
}

export interface ArticleBreadcrumbItem {
  name: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
}
