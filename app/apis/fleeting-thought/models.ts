import type { FleetingThought, GetListRequest, GetListResponse } from "#shared/types";

export interface CreateFleetingThoughtRequest {
  public: boolean;
  content: string;
}

export interface GetFleetingThoughtRequest extends GetListRequest {}

export interface GetFleetingThoughtResponse
  extends GetListResponse<FleetingThought> {}

export interface UpdateFleetingThoughtRequest {
  id: number;
  public: boolean;
  content?: string;
}
