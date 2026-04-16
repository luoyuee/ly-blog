import type { AuditTrailKeys } from "./common";

export interface SearchEngineItem {
  id: number;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  name: string;
  description?: string;
  url: string;
  icon: string;
  status: number;
}

export type SearchEngineForm = Partial<Omit<SearchEngineItem, AuditTrailKeys>> & {};

export interface ShortcutItem {
  id: number;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  name: string;
  description?: string;
  url: string;
  icon: string;
  status: number;
}

export type ShortcutForm = Partial<Omit<ShortcutItem, AuditTrailKeys>> & {};

export interface NavigationWebsiteItem {
  id: number;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  name: string;
  url: string;
  icon?: string;
  tags?: string[];
  description?: string;
  type?: number | null;
  hot: number;
  is_favorite: boolean;
  status: number;
}

export type NavigationWebsiteForm = Partial<Omit<NavigationWebsiteItem, AuditTrailKeys>> & {};

export interface SearchTips {
  id?: number;
  text: string;
  type: "text" | "link";
  url?: string;
  icon?: string;
}
