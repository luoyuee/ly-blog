import type {
  GetNavigationWebsitePaginatedRequest,
  GetNavigationWebsitePaginatedResponse,
  CreateNavigationWebsiteRequest,
  UpdateNavigationWebsiteRequest,
  SearchNavigationWebsiteRequest,
  SearchNavigationWebsiteResponse,
  GetSearchEngineListResponse,
  GetSearchEnginePaginatedRequest,
  GetSearchEnginePaginatedResponse,
  CreateSearchEngineRequest,
  UpdateSearchEngineRequest,
  GetShortcutListResponse,
  GetShortcutPaginatedRequest,
  GetShortcutPaginatedResponse,
  CreateShortcutRequest,
  UpdateShortcutRequest,
  CreateSearchHistoryRequest,
  GetSearchHistoryPaginatedRequest,
  GetSearchHistoryPaginatedResponse,
  ImportNavigationWebsiteResponse
} from "./models";
import type { AxiosProgressEvent } from "axios";
import request from "@/utils/request";

export const getPaginatedNavigationWebsites = (
  params: GetNavigationWebsitePaginatedRequest
): Promise<GetNavigationWebsitePaginatedResponse> => {
  return request({
    url: "/admin/navigation/website",
    method: "get",
    params
  });
};

export const createNavigationWebsite = (data: CreateNavigationWebsiteRequest): Promise<void> => {
  return request({
    url: "/admin/navigation/website",
    method: "post",
    data
  });
};

export const updateNavigationWebsite = (data: UpdateNavigationWebsiteRequest): Promise<void> => {
  return request({
    url: "/admin/navigation/website",
    method: "put",
    data
  });
};

export const deleteNavigationWebsite = (id: number): Promise<void> => {
  return request({
    url: "/admin/navigation/website/" + id,
    method: "delete"
  });
};

/**
 * 导入导航网站数据（JSON 文件）。
 * @param file - JSON 文件
 * @param callBack - 上传进度回调
 */
export const importNavigationWebsiteData = (
  file: File,
  callBack?: (e: AxiosProgressEvent) => void
): Promise<ImportNavigationWebsiteResponse> => {
  const form = new FormData();
  form.append("file", file as Blob);

  return request({
    url: "/admin/navigation/website/import",
    method: "post",
    data: form,
    onUploadProgress: callBack
  });
};

/**
 * 导出导航网站数据，返回 JSON Blob。
 */
export const exportNavigationWebsiteData = (): Promise<Blob> => {
  return request({
    url: "/admin/navigation/website/export",
    method: "get",
    responseType: "blob"
  });
};

/** 搜索导航网站 */
export const searchNavigationWebsites = (
  params: SearchNavigationWebsiteRequest
): Promise<SearchNavigationWebsiteResponse> => {
  return request({
    url: "/navigation/website/search",
    method: "get",
    params
  });
};

/** 获取全部搜索引擎 */
export const getSearchEngineList = (): Promise<GetSearchEngineListResponse> => {
  return request({
    url: "/admin/navigation/search-engine/all",
    method: "get"
  });
};

/** 获取前台可见搜索引擎 */
export const getPublicSearchEngineList = (): Promise<GetSearchEngineListResponse> => {
  return request({
    url: "/navigation/search-engine/all",
    method: "get"
  });
};

/** 获取分页搜索引擎 */
export const getPaginatedSearchEngines = (
  params: GetSearchEnginePaginatedRequest
): Promise<GetSearchEnginePaginatedResponse> => {
  return request({
    url: "/admin/navigation/search-engine",
    method: "get",
    params
  });
};

export const createSearchEngine = (data: CreateSearchEngineRequest): Promise<void> => {
  return request({
    url: "/admin/navigation/search-engine",
    method: "post",
    data
  });
};

export const updateSearchEngine = (data: UpdateSearchEngineRequest): Promise<void> => {
  return request({
    url: "/admin/navigation/search-engine",
    method: "put",
    data
  });
};

export const deleteSearchEngine = (id: number): Promise<void> => {
  return request({
    url: "/admin/navigation/search-engine/" + id,
    method: "delete"
  });
};

/** 获取全部快捷方式 */
export const getShortcutList = (): Promise<GetShortcutListResponse> => {
  return request({
    url: "/admin/navigation/shortcut/all",
    method: "get"
  });
};

/** 获取前台可见快捷方式 */
export const getPublicShortcutList = (): Promise<GetShortcutListResponse> => {
  return request({
    url: "/navigation/shortcut/all",
    method: "get"
  });
};

/** 获取分页快捷方式 */
export const getPaginatedShortcuts = (
  params: GetShortcutPaginatedRequest
): Promise<GetShortcutPaginatedResponse> => {
  return request({
    url: "/admin/navigation/shortcut",
    method: "get",
    params
  });
};

export const createShortcut = (data: CreateShortcutRequest): Promise<void> => {
  return request({
    url: "/admin/navigation/shortcut",
    method: "post",
    data
  });
};

export const updateShortcut = (data: UpdateShortcutRequest): Promise<void> => {
  return request({
    url: "/admin/navigation/shortcut",
    method: "put",
    data
  });
};

export const deleteShortcut = (id: number): Promise<void> => {
  return request({
    url: "/admin/navigation/shortcut/" + id,
    method: "delete"
  });
};

export const createSearchHistory = (data: CreateSearchHistoryRequest): Promise<void> => {
  return request({
    url: "/navigation/search-history",
    method: "post",
    data
  });
};

export const getPaginatedSearchHistories = (
  params: GetSearchHistoryPaginatedRequest
): Promise<GetSearchHistoryPaginatedResponse> => {
  return request({
    url: "/navigation/search-history",
    method: "get",
    params
  });
};

export const deleteSearchHistory = (id: number): Promise<void> => {
  return request({
    url: "/navigation/search-history/" + id,
    method: "delete"
  });
};
