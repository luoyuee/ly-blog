export interface ImageFolder {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  name: string;
  description?: string;
  cover?: string;
  count: number;
  size: number;
  is_system: boolean;
}

export interface Image {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  folder_id: number;
  tags?: string[];
  width: number;
  height: number;
  size: number;
  format: ImageFormat;
  preview: string;
  hash: string;
}

export interface ImageItem {
  id: number;
  width: number;
  height: number;
  hash: string;
  format: ImageFormat;
  size: number;
  preview: string;
}

export type ImageSelectItem = Pick<ImageItem, "id" | "hash" | "format" | "preview">;
