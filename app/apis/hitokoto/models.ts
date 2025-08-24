import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { HitokotoItem, HitokotoTypeItem } from "#shared/types/hitokoto";

export interface RandomHitokotoRequest {
  max_length?: number;
  type?: number[];
}

export type RandomHitokotoResponse = Pick<
  HitokotoItem,
  "id" | "type" | "author" | "source" | "content"
>;

export type GetHitokotoTypePaginatedRequest = GetPaginatedRequest;

export type GetHitokotoTypePaginatedResponse = GetPaginatedResponse<HitokotoTypeItem>;

export interface CreateHitokotoTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateHitokotoTypeResquest extends CreateHitokotoTypeRequest {
  id: number;
}

export interface GetHitokotoPaginatedRequest extends GetPaginatedRequest {
  type?: number;
  keyword?: string;
}

export interface GetHitokotoPaginatedResponse extends GetPaginatedResponse<HitokotoItem> {
  type?: number;
}
