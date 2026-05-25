import type {
  CreateAccessTokenRequest,
  CreateAccessTokenResponse,
  GetAccessTokenPaginatedRequest,
  GetAccessTokenPaginatedResponse,
  UpdateAccessTokenRequest
} from "./models";
import { serviceAxios } from "@/utils/request";

/**
 * 获取 Access Token 分页列表。
 */
export async function getPaginatedAccessTokens(
  params: GetAccessTokenPaginatedRequest
): Promise<GetAccessTokenPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/access-token",
      method: "get",
      params
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 创建 Access Token。
 */
export async function createAccessToken(
  data: CreateAccessTokenRequest
): Promise<CreateAccessTokenResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/access-token",
      method: "post",
      data
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 修改 Access Token。
 */
export async function updateAccessToken(data: UpdateAccessTokenRequest): Promise<void> {
  try {
    const { id, ...payload } = data;

    await serviceAxios({
      url: "/admin/access-token/" + id,
      method: "patch",
      data: payload
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 禁用 Access Token。
 */
export async function disableAccessToken(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/access-token/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
