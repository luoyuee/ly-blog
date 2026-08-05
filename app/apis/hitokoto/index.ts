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
import request from "@/utils/request";

export const getAllHitokotoType = (): Promise<HitokotoTypeItem[]> => {
  return request({
    url: "/admin/hitokoto/type/all",
    method: "get"
  });
};

export const getHitokotoDetails = (id: number): Promise<HitokotoTypeItem> => {
  return request({
    url: "/admin/hitokoto/type/" + id,
    method: "get"
  });
};

export const uploadHitokotoData = (
  file: File,
  callBack?: (e: AxiosProgressEvent) => void
): Promise<void> => {
  const form = new FormData();
  form.append("file", file as Blob);

  return request({
    url: "/admin/hitokoto/import",
    method: "post",
    data: form,
    onUploadProgress: callBack
  });
};

export const exportHitokotoData = (): Promise<Blob> => {
  return request({
    url: "/admin/hitokoto/export",
    method: "get",
    responseType: "blob"
  });
};

export const getHitokotoTypeList = (
  params: GetHitokotoTypePaginatedRequest
): Promise<GetHitokotoTypePaginatedResponse> => {
  return request({
    url: "/admin/hitokoto/type",
    method: "get",
    params
  });
};

export const getHitokotoTypeOptions = (): Promise<HitokotoTypeSelectOption[]> => {
  return request({
    url: "/admin/hitokoto/type/options",
    method: "get"
  });
};

export const createHitokotoType = (data: CreateHitokotoTypeRequest): Promise<void> => {
  return request({
    url: "/admin/hitokoto/type",
    method: "post",
    data
  });
};

export const updateHitokotoType = (data: UpdateHitokotoTypeResquest): Promise<void> => {
  return request({
    url: "/admin/hitokoto/type",
    method: "put",
    data
  });
};

export const deleteHitokotoType = (id: number): Promise<void> => {
  return request({
    url: "/admin/hitokoto/type/" + id,
    method: "delete"
  });
};

export const randomHitokoto = (data: RandomHitokotoRequest): Promise<RandomHitokotoResponse> => {
  return request({
    url: "/hitokoto/random",
    method: "post",
    data
  });
};

export const getPaginatedHitokotos = (
  params: GetHitokotoPaginatedRequest
): Promise<GetHitokotoPaginatedResponse> => {
  return request({
    url: "/admin/hitokoto",
    method: "get",
    params
  });
};

export const deleteHitokoto = (id: number): Promise<void> => {
  return request({
    url: "/admin/hitokoto/" + id,
    method: "delete"
  });
};

export const createHitokoto = (data: HitokotoForm): Promise<void> => {
  return request({
    url: "/admin/hitokoto",
    method: "post",
    data
  });
};

export const updateHitokoto = (data: RequiredKeys<HitokotoForm, "id">): Promise<void> => {
  return request({
    url: "/admin/hitokoto",
    method: "put",
    data
  });
};
