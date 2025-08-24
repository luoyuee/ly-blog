import type { RequiredKeys } from "#shared/types/utils";
import type {
  HitokotoTypeItem,
  HitokotoTypeSelectOption,
  HitokotoForm
} from "#shared/types/hitokoto";
import type {
  RandomHitokotoRequest,
  RandomHitokotoResponse,
  GetHitokotoPaginatedRequest,
  GetHitokotoPaginatedResponse,
  GetHitokotoTypePaginatedRequest,
  GetHitokotoTypePaginatedResponse,
  CreateHitokotoTypeRequest,
  UpdateHitokotoTypeResquest
} from "./models";
import type { AxiosProgressEvent } from "axios";
import { serviceAxios } from "@/utils/request";

export async function getAllHitokotoType(): Promise<HitokotoTypeItem[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/hitokoto/type/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getHitokotoDetails(id: number): Promise<HitokotoTypeItem> {
  try {
    const response = await serviceAxios({
      url: "/admin/hitokoto/type/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function uploadHitokotoData(
  file: File,
  callBack?: (e: AxiosProgressEvent) => void
): Promise<void> {
  try {
    const form = new FormData();
    form.append("file", file as Blob);

    const response = await serviceAxios({
      url: "/admin/hitokoto/import",
      method: "post",
      data: form,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (callBack) callBack(progressEvent);
      }
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getHitokotoTypeList(
  params: GetHitokotoTypePaginatedRequest
): Promise<GetHitokotoTypePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/hitokoto/type",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getHitokotoTypeOptions(): Promise<HitokotoTypeSelectOption[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/hitokoto/type/options",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createHitokotoType(data: CreateHitokotoTypeRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/hitokoto/type",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateHitokotoType(data: UpdateHitokotoTypeResquest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/hitokoto/type",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteHitokotoType(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/hitokoto/type/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function randomHitokoto(data: RandomHitokotoRequest): Promise<RandomHitokotoResponse> {
  try {
    const response = await serviceAxios({
      url: "/hitokoto/random",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPaginatedHitokotos(
  params: GetHitokotoPaginatedRequest
): Promise<GetHitokotoPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/hitokoto",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteHitokoto(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/hitokoto/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createHitokoto(data: HitokotoForm): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/hitokoto",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateHitokoto(data: RequiredKeys<HitokotoForm, "id">): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/hitokoto",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
