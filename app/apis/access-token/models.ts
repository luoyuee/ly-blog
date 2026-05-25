import type { AccessTokenScope } from "#shared/enums";
import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { AccessTokenItem, CreatedAccessToken } from "#shared/types/access-token";

/**
 * 获取 Access Token 分页数据请求。
 */
export type GetAccessTokenPaginatedRequest = GetPaginatedRequest;

/**
 * 获取 Access Token 分页数据响应。
 */
export type GetAccessTokenPaginatedResponse = GetPaginatedResponse<AccessTokenItem>;

/**
 * 创建 Access Token 请求。
 */
export interface CreateAccessTokenRequest {
  name: string;
  scopes: AccessTokenScope[];
  expires_at?: string | null;
}

/**
 * 修改 Access Token 请求。
 */
export interface UpdateAccessTokenRequest {
  id: number;
  name?: string;
  scopes?: AccessTokenScope[];
  expires_at?: string | null;
  status?: 0 | 1;
}

/**
 * 创建 Access Token 响应。
 */
export type CreateAccessTokenResponse = CreatedAccessToken;
