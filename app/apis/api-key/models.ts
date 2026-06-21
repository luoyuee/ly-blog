import type { ApiKeyScope } from "#shared/enums";
import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { ApiKeyItem, CreatedApiKey } from "#shared/types/api-key";

/**
 * 获取 API Key 分页数据请求。
 */
export type GetApiKeyPaginatedRequest = GetPaginatedRequest;

/**
 * 获取 API Key 分页数据响应。
 */
export type GetApiKeyPaginatedResponse = GetPaginatedResponse<ApiKeyItem>;

/**
 * 创建 API Key 请求。
 */
export interface CreateApiKeyRequest {
  name: string;
  scopes: ApiKeyScope[];
  expires_at?: string | null;
}

/**
 * 修改 API Key 请求。
 */
export interface UpdateApiKeyRequest {
  id: number;
  name?: string;
  scopes?: ApiKeyScope[];
  expires_at?: string | null;
  status?: 0 | 1;
}

/**
 * 创建 API Key 响应。
 */
export type CreateApiKeyResponse = CreatedApiKey;
