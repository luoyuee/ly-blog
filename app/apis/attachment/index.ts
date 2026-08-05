import type { AttachmentFolder, AttachmentItem } from "#shared/types/attachment";
import type {
  GetPaginatedAttachmentsRequest,
  GetPaginatedAttachmentsResponse,
  UploadAttachmentProgressCallback,
  UploadAttachmentRequest,
  UploadAttachmentResponse
} from "./models";
import request from "@/utils/request";

/**
 * 获取全部附件目录。
 */
export const getAllAttachmentFolder = (): Promise<AttachmentFolder[]> => {
  return request({
    url: "/admin/attachment/folder/all",
    method: "get"
  });
};

/**
 * 创建附件目录。
 */
export const createAttachmentFolder = (data: {
  name: string;
  icon?: string;
  description?: string;
}): Promise<AttachmentFolder> => {
  return request({
    url: "/admin/attachment/folder",
    method: "post",
    data
  });
};

/**
 * 更新附件目录。
 */
export const updateAttachmentFolder = (data: {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}): Promise<void> => {
  return request({
    url: "/admin/attachment/folder",
    method: "put",
    data
  });
};

/**
 * 删除附件目录。
 */
export const deleteAttachmentFolder = (id: number): Promise<void> => {
  return request({
    url: "/admin/attachment/folder/" + id,
    method: "delete"
  });
};

/**
 * 获取附件目录详情。
 */
export const getAttachmentFolderDetail = (id: number): Promise<AttachmentFolder> => {
  return request({
    url: "/admin/attachment/folder/detail/" + id,
    method: "get"
  });
};

/**
 * 获取附件分页列表。
 */
export const getPaginatedAttachments = (
  params: GetPaginatedAttachmentsRequest
): Promise<GetPaginatedAttachmentsResponse> => {
  return request({
    url: "/admin/attachment",
    method: "get",
    params
  });
};

/**
 * 删除附件文件。
 */
export const deleteAttachment = (id: number): Promise<void> => {
  return request({
    url: "/admin/attachment/" + id,
    method: "delete"
  });
};

/**
 * 获取附件详情。
 */
export const getAttachmentDetail = (id: number): Promise<AttachmentItem> => {
  return request({
    url: "/admin/attachment/" + id,
    method: "get"
  });
};

/**
 * 上传附件文件。
 */
export const uploadAttachmentFile = (
  data: UploadAttachmentRequest,
  callBack: UploadAttachmentProgressCallback
): Promise<UploadAttachmentResponse> => {
  const form = new FormData();
  form.append("folder", data.folder.toString());
  form.append("file", data.file as Blob);

  if (data.tags && data.tags.length > 0) {
    form.append("tags", data.tags.join(","));
  }

  return request({
    url: "/admin/attachment/upload",
    method: "post",
    data: form,
    onUploadProgress: callBack
  });
};
