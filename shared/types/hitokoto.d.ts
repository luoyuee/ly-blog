import { AuditTrailKeys } from "./common";

export interface HitokotoTypeItem {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  name: string;
  description?: string;
  count?: number;
}

export type HitokotoTypeForm = Partial<
  Omit<HitokotoTypeItem, AuditTrailKeys | "count">
> & {};

export type HitokotoTypeSelectOption = Pick<
  HitokotoTypeItem,
  "id" | "name" | "description"
>;

export interface HitokotoItem {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  type?: number;
  source?: string;
  content: string;
  author?: string;
  length?: number;
}

export type HitokotoForm = Partial<
  Omit<HitokotoItem, AuditTrailKeys | "length">
> & {};
