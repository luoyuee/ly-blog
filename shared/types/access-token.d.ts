import type { AccessTokenScope } from "#shared/enums";
import type { AuditTrailKeys } from "./common";

/**
 * Access Token 实体。
 */
export interface AccessTokenItem {
  id: number;
  created_at?: Date;
  created_by?: number;
  updated_at?: Date;
  updated_by?: number;
  name: string;
  scopes: AccessTokenScope[];
  expires_at?: Date | null;
  last_used_at?: Date | null;
  last_used_ip?: string | null;
  use_count: number;
  status: number;
}

/**
 * Access Token 表单。
 */
export type AccessTokenForm = Partial<Omit<AccessTokenItem, AuditTrailKeys | "last_used_at" | "last_used_ip" | "use_count">> & {};

/**
 * 创建 Access Token 响应。
 */
export interface CreatedAccessToken extends AccessTokenItem {
  token: string;
}
