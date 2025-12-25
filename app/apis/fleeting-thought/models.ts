import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { FleetingThought } from "#shared/types/fleeting-thought";

export interface CreateFleetingThoughtRequest {
  public: boolean;
  content: string;
}

export type GetFleetingThoughtPaginatedRequest = GetPaginatedRequest;

export type GetFleetingThoughtPaginatedResponse = GetPaginatedResponse<FleetingThought>;

export interface UpdateFleetingThoughtRequest {
  id: number;
  public: boolean;
  content?: string;
}
