/**
 * 支持下载的数据类型
 * - string: 字符串数据
 * - object: 对象数据（会被 JSON 序列化）
 * - unknown[]: 数组数据（会被 JSON 序列化）
 * - ArrayBuffer: 二进制数据
 */
export type DownloadData = string | object | unknown[] | ArrayBuffer;

/**
 * 下载文件
 * @param data - 文件数据，支持 string、object、array、ArrayBuffer 等类型
 * @param filename - 下载的文件名
 * @param options - 可选配置项
 * @param options.mimeType - MIME 类型，不传则根据数据类型自动推断
 */
export function downloadFile(
  data: DownloadData,
  filename: string,
  options?: {
    mimeType?: string;
  }
): void {
  const { mimeType } = options || {};

  let blob: Blob;

  if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: mimeType || "application/octet-stream" });
  } else if (typeof data === "string") {
    blob = new Blob([data], { type: mimeType || "text/plain;charset=utf-8" });
  } else if (Array.isArray(data) || typeof data === "object") {
    const jsonString = JSON.stringify(data, null, 2);
    blob = new Blob([jsonString], {
      type: mimeType || "application/json;charset=utf-8"
    });
  } else {
    blob = new Blob([String(data)], {
      type: mimeType || "text/plain;charset=utf-8"
    });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
