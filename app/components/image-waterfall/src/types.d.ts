export interface ImageItem {
  id: number;
  width: number;
  height: number;
  hash: string;
  format: ImageFormat;
  size?: number;
  preview: string;
}
