import type { UserRoleEnum } from "@/enums";
import type { HTTPMethod } from "h3";

export interface GetListRequest {
  page: number;
  per_page: number;
}

export interface GetListResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
}

export interface LogMessage {
  ip: string;
  path: string;
  method: HTTPMethod;
  time: number;
}

export interface Note {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  content_updated_at: number;
  folder?: number;
  filename: string;
  content: string;
  words: number;
  article_id?: number;
}

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

export interface ArticleCategory {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  parent?: number;
  name: string;
  description?: string;
}

export interface ArticleCategoryTreeItem extends ArticleCategory {
  children?: ArticleCategoryTreeItem[];
}

export interface ViewArticleDetail {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  content_updated_at: number;
  category?: number;
  category_name?: string;
  title: string;
  abstract: string;
  content: string;
  words: number;
  tags?: string[];
  author: string;
  enable_comments: boolean;
  enable_tipping: boolean;
  toc: ArticleTOCItem[];
  views_count: number;
  comments_count: number;
  likes_count: number;
  locked?: boolean;
}

export interface ArticleTOCItem {
  id: number;
  level: number;
  title: string;
  parent?: number;
  children?: ArticleTOCItem[];
}

export interface ArticleComment {
  id: number;
  created_at: number;
  avatar?: string;
  nickname: string;
  role: number;
  email: string;
  website?: string;
  content: string;
  parent?: number;
  reply?: number;
  reply_nickname?: string;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
  children?: ArticleComment[];
}

export type ImageFormat = "png" | "jpg" | "svg" | "gif" | "webp";
export type UserAvatarFormat = "png" | "jpg" | "webp";

export interface ArticleListItem {
  id: number;
  title: string;
  abstract: string;
  content_updated_at: number;
  category?: number;
  tags?: string[];
  cover?: string[];
  views_count: number;
  comments_count: number;
  likes_count: number;
}

export interface MessageItem {
  id: number;
  created_at: number;
  avatar?: string;
  nickname: string;
  role: number;
  email: string;
  website?: string;
  content: string;
  parent?: number;
  reply?: number;
  reply_nickname?: string;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
  children?: MessageItem[];
}

export interface FleetingThought {
  id: number;
  created_at: number;
  content: string;
  public: boolean;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
}

export interface UserInfo {
  username: string;
  email: string;
  avatar: string;
  role: UserRoleEnum;
  last_login_time: number;
}
