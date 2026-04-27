import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type {
  NavigationWebsiteItem,
  SearchEngineItem,
  SearchHistoryItem,
  ShortcutItem
} from "#shared/types/navigation-website";

export interface GetNavigationWebsitePaginatedRequest extends GetPaginatedRequest {
  keyword?: string;
  type?: number;
  status?: number;
}

export type GetNavigationWebsitePaginatedResponse = GetPaginatedResponse<NavigationWebsiteItem>;

export interface CreateNavigationWebsiteRequest {
  name: string;
  url: string;
  icon?: string;
  tags?: string[] | null;
  description?: string;
  type?: number;
  hot?: number;
  is_favorite?: boolean;
  is_public?: boolean;
  status?: number;
}

export interface UpdateNavigationWebsiteRequest extends CreateNavigationWebsiteRequest {
  id: number;
}

/** 搜索导航网站请求 */
export interface SearchNavigationWebsiteRequest {
  keyword: string;
  limit?: number;
}

/** 搜索导航网站响应 */
export type SearchNavigationWebsiteResponse = NavigationWebsiteItem[];

/** 获取全部搜索引擎响应 */
export interface GetSearchEngineListResponse {
  data: SearchEngineItem[];
}

/** 获取分页搜索引擎请求 */
export interface GetSearchEnginePaginatedRequest extends GetPaginatedRequest {
  status?: number;
  keyword?: string;
}

/** 获取分页搜索引擎响应 */
export type GetSearchEnginePaginatedResponse = GetPaginatedResponse<SearchEngineItem>;

export interface CreateSearchEngineRequest {
  name: string;
  description?: string;
  url: string;
  icon: string;
  is_public?: boolean;
  status?: number;
}

export interface UpdateSearchEngineRequest extends CreateSearchEngineRequest {
  id: number;
}

/** 获取全部快捷方式响应 */
export interface GetShortcutListResponse {
  data: ShortcutItem[];
}

/** 获取分页快捷方式请求 */
export interface GetShortcutPaginatedRequest extends GetPaginatedRequest {
  status?: number;
  keyword?: string;
}

/** 获取分页快捷方式响应 */
export type GetShortcutPaginatedResponse = GetPaginatedResponse<ShortcutItem>;

export interface CreateShortcutRequest {
  name: string;
  description?: string;
  url: string;
  icon: string;
  is_public?: boolean;
  status?: number;
}

export interface UpdateShortcutRequest extends CreateShortcutRequest {
  id: number;
}

export interface CreateSearchHistoryRequest {
  search_engine_id: number;
  keyword: string;
}

export interface GetSearchHistoryPaginatedRequest extends GetPaginatedRequest {
  keyword?: string;
  search_engine_id?: number;
}

export type GetSearchHistoryPaginatedResponse = GetPaginatedResponse<SearchHistoryItem>;
