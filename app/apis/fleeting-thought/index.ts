import type { FleetingThought } from "#shared/types/fleeting-thought";
import type {
  CreateFleetingThoughtRequest,
  GetFleetingThoughtPaginatedRequest,
  GetFleetingThoughtPaginatedResponse,
  UpdateFleetingThoughtRequest
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function createFleetingThought(
  data: CreateFleetingThoughtRequest
): Promise<FleetingThought> {
  try {
    const response = await serviceAxios({
      url: "/admin/thought",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPaginatedFleetingThought(
  params: GetFleetingThoughtPaginatedRequest
): Promise<GetFleetingThoughtPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/thought",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteFleetingThought(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/thought/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateFleetingThought(
  data: UpdateFleetingThoughtRequest
): Promise<FleetingThought> {
  try {
    const response = await serviceAxios({
      url: "/admin/thought",
      method: "patch",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
