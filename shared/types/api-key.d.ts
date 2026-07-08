import type { ApiKeyScope } from "#shared/enums";
import type { AuditTrailKeys } from "./common";

/**
 * API Key 实体。
 */
export interface ApiKeyItem {
  id: number;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  name: string;
  scopes: ApiKeyScope[];
  expires_at?: Date | null;
  last_used_at?: Date | null;
  last_used_ip?: string | null;
  use_count: number;
  status: number;
}

/**
 * API Key 表单。
 */
export type ApiKeyForm = Partial<Omit<ApiKeyItem, AuditTrailKeys | "last_used_at" | "last_used_ip" | "use_count">> & {};

/**
 * 创建 API Key 响应。
 */
export interface CreatedApiKey extends ApiKeyItem {
  secret_key: string;
}
