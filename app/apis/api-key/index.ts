import type {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  GetApiKeyPaginatedRequest,
  GetApiKeyPaginatedResponse,
  UpdateApiKeyRequest
} from "./models";
import request from "@/utils/request";

/**
 * 获取 API Key 分页列表。
 */
export const getPaginatedApiKeys = (
  params: GetApiKeyPaginatedRequest
): Promise<GetApiKeyPaginatedResponse> => {
  return request({
    url: "/admin/api-key",
    method: "get",
    params
  });
};

/**
 * 创建 API Key。
 */
export const createApiKey = (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
  return request({
    url: "/admin/api-key",
    method: "post",
    data
  });
};

/**
 * 修改 API Key。
 */
export const updateApiKey = (data: UpdateApiKeyRequest): Promise<void> => {
  const { id, ...payload } = data;

  return request({
    url: "/admin/api-key/" + id,
    method: "patch",
    data: payload
  });
};

/**
 * 禁用 API Key。
 */
export const disableApiKey = (id: number): Promise<void> => {
  return request({
    url: "/admin/api-key/" + id,
    method: "delete"
  });
};
