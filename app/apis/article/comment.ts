import type { ArticleComment } from "#shared/types/article";
import type {
  CreateArticleCommentRequest,
  GetAdminArticleCommentListRequest,
  GetArticleCommentListRequest,
  GetArticleCommentListResponse,
  UpdateArticleCommentContentRequest
} from "./models";
import request from "@/utils/request";

export const createArticleComment = (
  data: CreateArticleCommentRequest
): Promise<ArticleComment> => {
  return request({
    url: "/article/comment",
    method: "post",
    data
  });
};

export const getArticleCommentList = (
  params: GetArticleCommentListRequest
): Promise<GetArticleCommentListResponse> => {
  return request({
    url: "/article/comment",
    method: "get",
    params
  });
};

export const getAdminArticleCommentList = (
  params: GetAdminArticleCommentListRequest
): Promise<GetArticleCommentListResponse> => {
  return request({
    url: "/admin/article/comment",
    method: "get",
    params
  });
};

export const deleteArticleComment = (id: number): Promise<void> => {
  return request({
    url: "/admin/article/comment/" + id,
    method: "delete"
  });
};

export const updateCommentContent = (data: UpdateArticleCommentContentRequest): Promise<void> => {
  return request({
    url: "/admin/article/comment/content",
    method: "patch",
    data
  });
};
