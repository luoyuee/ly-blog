import type { HTTPMethod } from "h3";

export interface LogMessage {
  ip: string;
  path: string;
  method: HTTPMethod;
  time: number;
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
