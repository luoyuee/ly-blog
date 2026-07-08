import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { AttachmentItem } from "#shared/types/attachment";
import type { AxiosProgressEvent } from "axios";

/**
 * 获取附件分页列表请求参数。
 */
export interface GetPaginatedAttachmentsRequest extends GetPaginatedRequest {
  folder: number;
  keyword?: string;
}

/**
 * 获取附件分页列表响应。
 */
export type GetPaginatedAttachmentsResponse = GetPaginatedResponse<AttachmentItem>;

/**
 * 上传附件请求参数。
 */
export interface UploadAttachmentRequest {
  folder: number;
  file: File | Blob;
  tags?: string[];
}

/**
 * 上传附件响应。
 */
export interface UploadAttachmentResponse extends AttachmentItem {}

export type UploadAttachmentProgressCallback = (event: AxiosProgressEvent) => void;
