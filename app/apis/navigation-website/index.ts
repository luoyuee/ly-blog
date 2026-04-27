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
  GetSearchHistoryPaginatedResponse
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function getPaginatedNavigationWebsites(
  params: GetNavigationWebsitePaginatedRequest
): Promise<GetNavigationWebsitePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/navigation/website",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createNavigationWebsite(data: CreateNavigationWebsiteRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/website",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateNavigationWebsite(data: UpdateNavigationWebsiteRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/website",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteNavigationWebsite(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/website/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 搜索导航网站 */
export async function searchNavigationWebsites(
  params: SearchNavigationWebsiteRequest
): Promise<SearchNavigationWebsiteResponse> {
  try {
    const response = await serviceAxios({
      url: "/navigation/website/search",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取全部搜索引擎 */
export async function getSearchEngineList(): Promise<GetSearchEngineListResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/navigation/search-engine/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取前台可见搜索引擎 */
export async function getPublicSearchEngineList(): Promise<GetSearchEngineListResponse> {
  try {
    const response = await serviceAxios({
      url: "/navigation/search-engine/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取分页搜索引擎 */
export async function getPaginatedSearchEngines(
  params: GetSearchEnginePaginatedRequest
): Promise<GetSearchEnginePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/navigation/search-engine",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createSearchEngine(data: CreateSearchEngineRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/search-engine",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateSearchEngine(data: UpdateSearchEngineRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/search-engine",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteSearchEngine(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/search-engine/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取全部快捷方式 */
export async function getShortcutList(): Promise<GetShortcutListResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/navigation/shortcut/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取前台可见快捷方式 */
export async function getPublicShortcutList(): Promise<GetShortcutListResponse> {
  try {
    const response = await serviceAxios({
      url: "/navigation/shortcut/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取分页快捷方式 */
export async function getPaginatedShortcuts(
  params: GetShortcutPaginatedRequest
): Promise<GetShortcutPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/navigation/shortcut",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createShortcut(data: CreateShortcutRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/shortcut",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateShortcut(data: UpdateShortcutRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/shortcut",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteShortcut(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/navigation/shortcut/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createSearchHistory(data: CreateSearchHistoryRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/navigation/search-history",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPaginatedSearchHistories(
  params: GetSearchHistoryPaginatedRequest
): Promise<GetSearchHistoryPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/navigation/search-history",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteSearchHistory(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/navigation/search-history/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
