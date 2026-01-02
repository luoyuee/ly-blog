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
import { serviceAxios } from "@/utils/request";

export async function getAllArticleCategory(): Promise<ArticleCategory[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleCategoryOptions(): Promise<ArticleCategoryOption[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/options",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleCategoryTree(): Promise<ArticleCategoryTree> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/tree",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createArticleCategory(
  data: CreateArticleCategoryRequest
): Promise<ArticleCategory> {
  try {
    const response = await serviceAxios({
      url: "/article/category",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateArticleCategory(data: UpdateArticleCategoryRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/article/category",
      method: "put",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleCategoryDetails(id: number): Promise<ArticleCategory> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteArticleCategory(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/category/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function publishArticle(data: PublishArticleRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/publish",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updatedPublishArticle(data: UpdateArticleRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/publish",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取文章详情
export async function getArticleDetail(id: number): Promise<Article> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/detail/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPaginatedArticles(
  params: GetArticlePaginatedRequest
): Promise<GetArticlePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/article",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getAdminPaginatedArticles(
  params: GetAdminArticlePaginatedRequest
): Promise<GetAdminArticlePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/article",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteArticle(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function searchArticle(
  params: SearchArticleRequest
): Promise<GetArticlePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/article/search",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function confirmLikeArticle(id: number): Promise<LikeResponse> {
  try {
    const response = await serviceAxios({
      url: "/article/like/" + id,
      method: "post"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function cancelLikeArticle(id: number): Promise<LikeResponse> {
  try {
    const response = await serviceAxios({
      url: "/article/like/" + id,
      method: "delete"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
