import type {
  CreateArticleCategoryRequest,
  GetArticleListRequest,
  GetArticleListResponse,
  PublishArticleRequest,
  SearchArticleRequest,
  UpdateArticleCategoryRequest,
  UpdateArticleRequest,
  LikeResponse,
} from "./models";
import type { ArticleDetail } from "#shared/types";
import type {
  ArticleCategoryItem,
  ArticleCategorySelectOption,
} from "#shared/types/article";
import { serviceAxios } from "@/utils/request";

export async function getAllArticleCategory(): Promise<ArticleCategoryItem[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/all",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
export async function getArticleCategoryOptions(): Promise<
  ArticleCategorySelectOption[]
> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/options",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createArticleCategory(
  data: CreateArticleCategoryRequest
): Promise<ArticleCategoryItem> {
  try {
    const response = await serviceAxios({
      url: "/article/category",
      method: "post",
      data,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateArticleCategory(
  data: UpdateArticleCategoryRequest
): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/article/category",
      method: "put",
      data,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleCategoryDetails(
  id: number
): Promise<ArticleCategoryItem> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/category/" + id,
      method: "get",
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
      method: "delete",
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleCategoryItems(): Promise<
  ArticleCategoryItem[]
> {
  try {
    const response = await serviceAxios({
      url: "/article/category/items",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function publishArticle(
  data: PublishArticleRequest
): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/publish",
      method: "post",
      data,
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updatedPublishArticle(
  data: UpdateArticleRequest
): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/article/publish",
      method: "put",
      data,
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

// 获取文章详情
export async function getArticleDetail(id: number): Promise<ArticleDetail> {
  try {
    const response = await serviceAxios({
      url: "/admin/article/detail/" + id,
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getArticleList(
  params: GetArticleListRequest
): Promise<GetArticleListResponse> {
  try {
    const response = await serviceAxios({
      url: "/article",
      method: "get",
      params,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getAdminArticleList(
  params: GetArticleListRequest
): Promise<GetArticleListResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/article",
      method: "get",
      params,
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
      method: "delete",
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function searchArticle(
  params: SearchArticleRequest
): Promise<GetArticleListResponse> {
  try {
    const response = await serviceAxios({
      url: "/article/search",
      method: "get",
      params,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function likeArticle(id: number): Promise<LikeResponse> {
  try {
    const response = await serviceAxios({
      url: "/article/like/" + id,
      method: "post",
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
      method: "delete",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
