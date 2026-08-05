import type {
  CreateArticleCategoryRequest,
  GetArticlePaginatedRequest,
  GetArticlePaginatedResponse,
  PublishArticleRequest,
  SearchArticleRequest,
  UpdateArticleCategoryRequest,
  UpdateArticleRequest,
  LikeResponse,
  GetAdminArticlePaginatedRequest,
  GetAdminArticlePaginatedResponse
} from "./models";
import type {
  ArticleCategory,
  ArticleCategoryOption,
  ArticleCategoryTree,
  Article
} from "#shared/types/article";
import request from "@/utils/request";

export const getAllArticleCategory = (): Promise<ArticleCategory[]> => {
  return request({
    url: "/admin/article/category/all",
    method: "get"
  });
};

export const getArticleCategoryOptions = (): Promise<ArticleCategoryOption[]> => {
  return request({
    url: "/admin/article/category/options",
    method: "get"
  });
};

export const getArticleCategoryTree = (): Promise<ArticleCategoryTree> => {
  return request({
    url: "/admin/article/category/tree",
    method: "get"
  });
};

export const createArticleCategory = (
  data: CreateArticleCategoryRequest
): Promise<ArticleCategory> => {
  return request({
    url: "/article/category",
    method: "post",
    data
  });
};

export const updateArticleCategory = (data: UpdateArticleCategoryRequest): Promise<void> => {
  return request({
    url: "/article/category",
    method: "put",
    data
  });
};

export const getArticleCategoryDetails = (id: number): Promise<ArticleCategory> => {
  return request({
    url: "/admin/article/category/" + id,
    method: "get"
  });
};

export const deleteArticleCategory = (id: number): Promise<void> => {
  return request({
    url: "/admin/article/category/" + id,
    method: "delete"
  });
};

export const publishArticle = (data: PublishArticleRequest): Promise<void> => {
  return request({
    url: "/admin/article/publish",
    method: "post",
    data
  });
};

export const updatedPublishArticle = (data: UpdateArticleRequest): Promise<void> => {
  return request({
    url: "/admin/article/publish",
    method: "put",
    data
  });
};

// 获取文章详情
export const getArticleDetail = (id: number): Promise<Article> => {
  return request({
    url: "/admin/article/detail/" + id,
    method: "get"
  });
};

export const getPaginatedArticles = (
  params: GetArticlePaginatedRequest
): Promise<GetArticlePaginatedResponse> => {
  return request({
    url: "/article",
    method: "get",
    params
  });
};

export const getAdminPaginatedArticles = (
  params: GetAdminArticlePaginatedRequest
): Promise<GetAdminArticlePaginatedResponse> => {
  return request({
    url: "/admin/article",
    method: "get",
    params
  });
};

export const deleteArticle = (id: number): Promise<void> => {
  return request({
    url: "/admin/article/" + id,
    method: "delete"
  });
};

export const searchArticle = (
  params: SearchArticleRequest
): Promise<GetArticlePaginatedResponse> => {
  return request({
    url: "/article/search",
    method: "get",
    params
  });
};

export const confirmLikeArticle = (id: number): Promise<LikeResponse> => {
  return request({
    url: "/article/like/" + id,
    method: "post"
  });
};

export const cancelLikeArticle = (id: number): Promise<LikeResponse> => {
  return request({
    url: "/article/like/" + id,
    method: "delete"
  });
};
