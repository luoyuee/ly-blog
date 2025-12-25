import type {
  CreateArticleCommentRequest,
  GetAdminArticleCommentListRequest,
  GetArticleCommentListRequest,
  GetArticleCommentListResponse,
  UpdateArticleCommentContentRequest
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function createArticleComment(data: CreateArticleCommentRequest): Promise<any> {
  try {
    const response = await serviceAxios({
      url: "/article/comment",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleCommentList(
  params: GetArticleCommentListRequest
): Promise<GetArticleCommentListResponse> {
  try {
    const response = await serviceAxios({
      url: "/article/comment",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getAdminArticleCommentList(
  params: GetAdminArticleCommentListRequest
): Promise<GetArticleCommentListResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/comment",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteArticleComment(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/comment/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateCommentContent(
  data: UpdateArticleCommentContentRequest
): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/comment/content",
      method: "patch",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
