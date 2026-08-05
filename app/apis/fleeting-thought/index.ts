import type { FleetingThought } from "#shared/types/fleeting-thought";
import type {
  CreateFleetingThoughtRequest,
  GetFleetingThoughtPaginatedRequest,
  GetFleetingThoughtPaginatedResponse,
  UpdateFleetingThoughtRequest
} from "./models";
import request from "@/utils/request";

export const createFleetingThought = (
  data: CreateFleetingThoughtRequest
): Promise<FleetingThought> => {
  return request({
    url: "/admin/thought",
    method: "post",
    data
  });
};

export const getPaginatedFleetingThought = (
  params: GetFleetingThoughtPaginatedRequest
): Promise<GetFleetingThoughtPaginatedResponse> => {
  return request({
    url: "/thought",
    method: "get",
    params
  });
};

export const deleteFleetingThought = (id: number): Promise<void> => {
  return request({
    url: "/admin/thought/" + id,
    method: "delete"
  });
};

export const updateFleetingThought = (
  data: UpdateFleetingThoughtRequest
): Promise<FleetingThought> => {
  return request({
    url: "/admin/thought",
    method: "patch",
    data
  });
};
