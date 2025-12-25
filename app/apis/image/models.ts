import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { ImageItem } from "#shared/types/image";

export interface UploadImageItem {
  file: File;
  preview: string;
  tags: string[];
  status: "waiting" | "uploading" | "succeed" | "failed";
  upload_progress: number;
}

export interface UploadImageRequest {
  file: File;
  folder: number;
  tags?: string[];
}

export interface UploadImageResponse {
  id: number;
  folder: number;
  hash: string;
  height: number;
  width: number;
  size: number;
  tags?: string[];
  created_at: number;
  created_by: number;
}

export interface GetPaginatedImagesRequest extends GetPaginatedRequest {
  folder: number;
}

export type GetPaginatedImagesResponse = GetPaginatedResponse<ImageItem>;
