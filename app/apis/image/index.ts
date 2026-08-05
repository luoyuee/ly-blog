import type { Image, ImageFolder } from "#shared/types/image";
import type { AxiosProgressEvent } from "axios";
import type {
  GetPaginatedImagesRequest,
  GetPaginatedImagesResponse,
  UploadImageRequest,
  UploadImageResponse
} from "./models";
import request from "@/utils/request";

export const getAllImageFolder = (): Promise<ImageFolder[]> => {
  return request({
    url: "/admin/image/folder/all",
    method: "get"
  });
};

export const createImageFolder = (data: {
  name: string;
  description?: string;
}): Promise<ImageFolder> => {
  return request({
    url: "/admin/image/folder",
    method: "post",
    data
  });
};

export const updateImageFolder = (data: {
  id: number;
  name: string;
  description?: string;
}): Promise<void> => {
  return request({
    url: "/admin/image/folder",
    method: "put",
    data
  });
};

export const getImageFolderDetail = (id: number): Promise<ImageFolder> => {
  return request({
    url: "/admin/image/folder/detail/" + id,
    method: "delete"
  });
};

export const deleteImageFolder = (id: number): Promise<void> => {
  return request({
    url: "/admin/image/folder/" + id,
    method: "delete"
  });
};

export const uploadImageFile = (
  data: UploadImageRequest,
  callBack: (e: AxiosProgressEvent) => void
): Promise<UploadImageResponse> => {
  const form = new FormData();
  form.append("folder", data.folder.toString());
  form.append("file", data.file as Blob);
  if (data.tags && data.tags.length > 0) {
    form.append("tags", data.tags.join(","));
  }

  return request({
    url: "/admin/image/upload",
    method: "post",
    data: form,
    onUploadProgress: callBack
  });
};

export const getPaginatedImages = (
  params: GetPaginatedImagesRequest
): Promise<GetPaginatedImagesResponse> => {
  const { folder, ...rest } = params;
  return request({
    url: "/admin/image/" + folder,
    method: "get",
    params: rest
  });
};

export const getImageDetail = (id: number): Promise<Image> => {
  return request({
    url: "/admin/image/detail/" + id,
    method: "get"
  });
};

export const downloadImageFile = (
  id: number,
  format?: "webp" | "jpg" | "png",
  callBack?: (e: AxiosProgressEvent) => void
): Promise<Blob> => {
  return request({
    url: `/admin/image/download/${id}`,
    method: "get",
    params: { format },
    responseType: "blob",
    onDownloadProgress: callBack
  });
};

export const deleteImageFile = (id: number): Promise<void> => {
  return request({
    url: "/admin/image/" + id,
    method: "delete"
  });
};

export const updateImageTags = (data: { id: number; tags?: string[] }): Promise<Image> => {
  return request({
    url: "/admin/image",
    method: "patch",
    data
  });
};
