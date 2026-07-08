import type { AuditTrailKeys } from "./common";

/**
 * 附件目录实体。
 */
export interface AttachmentFolder {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  name: string;
  icon?: string;
  description?: string;
  cover?: string;
  count: number;
  size: number;
}

/**
 * 附件条目实体。
 */
export interface AttachmentItem {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  folder_id: number;
  asset_id: number;
  filename: string;
  original_name?: string;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  download_count: number;
  password?: string;
  ext?: string;
  mime_type?: string;
  size: number;
  url?: string;
  hash?: string;
}

/**
 * 附件目录表单数据。
 */
export type AttachmentFolderForm = Partial<Omit<AttachmentFolder, AuditTrailKeys | "count" | "size" | "cover">> & {};
