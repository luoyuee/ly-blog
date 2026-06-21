import type {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  GetApiKeyPaginatedRequest,
  GetApiKeyPaginatedResponse,
  UpdateApiKeyRequest
} from "./models";
import { serviceAxios } from "@/utils/request";

/**
 * 获取 API Key 分页列表。
 */
export async function getPaginatedApiKeys(params: GetApiKeyPaginatedRequest): Promise<GetApiKeyPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/api-key",
      method: "get",
      params
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 创建 API Key。
 */
export async function createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/api-key",
      method: "post",
      data
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 修改 API Key。
 */
export async function updateApiKey(data: UpdateApiKeyRequest): Promise<void> {
  try {
    const { id, ...payload } = data;

    await serviceAxios({
      url: "/admin/api-key/" + id,
      method: "patch",
      data: payload
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 禁用 API Key。
 */
export async function disableApiKey(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/api-key/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
