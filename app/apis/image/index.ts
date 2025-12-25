import type { Image, ImageFolder } from "#shared/types/image";
import type { AxiosProgressEvent } from "axios";
import type {
  GetPaginatedImagesRequest,
  GetPaginatedImagesResponse,
  UploadImageRequest,
  UploadImageResponse
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function getAllImageFolder(): Promise<ImageFolder[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/image/folder/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function createImageFolder(data: {
  name: string;
  description?: string;
}): Promise<ImageFolder> {
  try {
    const response = await serviceAxios({
      url: "/admin/image/folder",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateImageFolder(data: {
  id: number;
  name: string;
  description?: string;
}): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/image/folder",
      method: "put",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getImageFolderDetail(id: number): Promise<ImageFolder> {
  try {
    const response = await serviceAxios({
      url: "/admin/image/folder/detail/" + id,
      method: "delete"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteImageFolder(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/image/folder/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export const uploadImageFile = async (
  data: UploadImageRequest,
  callBack: (e: AxiosProgressEvent) => void
): Promise<UploadImageResponse> => {
  try {
    const form = new FormData();
    form.append("folder", data.folder.toString());
    form.append("file", data.file as Blob);
    if (data.tags && data.tags.length > 0) {
      form.append("tags", data.tags.join(","));
    }

    const response = await serviceAxios({
      url: "/admin/image/upload",
      method: "post",
      data: form,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        callBack(progressEvent);
      }
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export async function getPaginatedImages(
  params: GetPaginatedImagesRequest
): Promise<GetPaginatedImagesResponse> {
  try {
    const { folder, ...rest } = params;
    const response = await serviceAxios({
      url: "/admin/image/" + folder,
      method: "get",
      params: rest
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const getImageDetail = async (id: number): Promise<Image> => {
  try {
    const response = await serviceAxios({
      url: "/admin/image/detail/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export async function downloadImageFile(
  id: number,
  format?: "webp" | "jpg" | "png",
  callBack?: (e: AxiosProgressEvent) => void
): Promise<Blob> {
  try {
    const response = await serviceAxios({
      url: `/admin/image/download/${id}`,
      method: "get",
      params: { format },
      responseType: "blob",
      onUploadProgress: callBack
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteImageFile(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/image/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateImageTags(data: { id: number; tags?: string[] }): Promise<Image> {
  try {
    const response = await serviceAxios({
      url: "/admin/image",
      method: "patch",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
