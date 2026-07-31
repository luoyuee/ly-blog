import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";

/**
 * 画布文档列表项（不含核心数据 data）
 * @description 列表接口返回的精简结构，避免大 JSON 拖慢列表渲染
 */
export interface CanvasDocumentListItem {
  id: number;
  created_at: string | null;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
  type: string;
  title: string;
  description: string | null;
  cover: string | null;
  status: number;
}

/**
 * 画布文档详情（含核心数据 data）
 * @description 详情接口返回的完整结构，data 由前端组件按 type 自治解析
 */
export interface CanvasDocumentDetail {
  id: number;
  created_at: string | null;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
  type: string;
  title: string;
  description: string | null;
  data: Record<string, unknown>;
  cover: string | null;
  status: number;
}

/** 分页查询画布文档请求 */
export interface GetCanvasDocumentPaginatedRequest extends GetPaginatedRequest {
  status?: number;
  keyword?: string;
}

/** 分页查询画布文档响应 */
export type GetCanvasDocumentPaginatedResponse = GetPaginatedResponse<CanvasDocumentListItem>;

/** 创建画布文档请求 */
export interface CreateCanvasDocumentRequest {
  title: string;
  description?: string;
  data: Record<string, unknown>;
  cover?: string;
}

/** 更新画布文档请求 */
export interface UpdateCanvasDocumentRequest {
  id: number;
  title?: string;
  description?: string;
  data?: Record<string, unknown>;
  cover?: string;
  status?: number;
}
