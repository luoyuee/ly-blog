/**
 * 系统审计跟踪字段集合
 * 包含实体创建/修改的时态信息和操作人标记
 * 适用于需要排除自动管理字段的场景（如表单、公开API等）
 */
export type AuditTrailKeys = "created_at" | "created_by" | "updated_at" | "updated_by";

export interface GetPaginatedRequest {
  page: number;
  per_page: number;
}

export interface GetPaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
}
