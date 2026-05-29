import type { AttachmentFolder, AttachmentItem } from "#shared/types/attachment";
import type {
  GetPaginatedAttachmentsRequest,
  GetPaginatedAttachmentsResponse,
  UploadAttachmentProgressCallback,
  UploadAttachmentRequest,
  UploadAttachmentResponse
} from "./models";
import { serviceAxios } from "@/utils/request";

/**
 * 获取全部附件目录。
 */
export async function getAllAttachmentFolder(): Promise<AttachmentFolder[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/attachment/folder/all",
      method: "get"
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 创建附件目录。
 */
export async function createAttachmentFolder(data: {
  name: string;
  description?: string;
}): Promise<AttachmentFolder> {
  try {
    const response = await serviceAxios({
      url: "/admin/attachment/folder",
      method: "post",
      data
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 更新附件目录。
 */
export async function updateAttachmentFolder(data: {
  id: number;
  name: string;
  description?: string;
}): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/attachment/folder",
      method: "put",
      data
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 删除附件目录。
 */
export async function deleteAttachmentFolder(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/attachment/folder/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 获取附件目录详情。
 */
export async function getAttachmentFolderDetail(id: number): Promise<AttachmentFolder> {
  try {
    const response = await serviceAxios({
      url: "/admin/attachment/folder/detail/" + id,
      method: "get"
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 获取附件分页列表。
 */
export async function getPaginatedAttachments(
  params: GetPaginatedAttachmentsRequest
): Promise<GetPaginatedAttachmentsResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/attachment",
      method: "get",
      params
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 删除附件文件。
 */
export async function deleteAttachment(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/attachment/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 获取附件详情。
 */
export async function getAttachmentDetail(id: number): Promise<AttachmentItem> {
  try {
    const response = await serviceAxios({
      url: "/admin/attachment/" + id,
      method: "get"
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 上传附件文件。
 */
export const uploadAttachmentFile = async (
  data: UploadAttachmentRequest,
  callBack: UploadAttachmentProgressCallback
): Promise<UploadAttachmentResponse> => {
  try {
    const form = new FormData();
    form.append("folder", data.folder.toString());
    form.append("file", data.file as Blob);

    if (data.tags && data.tags.length > 0) {
      form.append("tags", data.tags.join(","));
    }

    const response = await serviceAxios({
      url: "/admin/attachment/upload",
      method: "post",
      data: form,
      onUploadProgress: callBack
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
