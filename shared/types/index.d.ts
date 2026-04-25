import type { HTTPMethod } from "h3";

export type UISize = "xs" | "sm" | "md" | "lg" | "xl";

export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

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

interface RecipientOption {
  avatar?: string | null;
  nickname: string;
  email: string;
  website?: string | null;
}
