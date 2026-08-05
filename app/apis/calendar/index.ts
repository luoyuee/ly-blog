import type { ClearDateAttributeResponse, ImportDateAttributeResponse } from "./models";
import request from "@/utils/request";

/**
 * 日期拓展数据接口封装。
 * @description 对应服务端 `server/api/admin/date-attribute` 目录下的接口。
 */

/**
 * 清空全部日期拓展数据。
 */
export const clearDateAttributes = (): Promise<ClearDateAttributeResponse> => {
  return request({
    url: "/admin/date-attribute/clear",
    method: "delete"
  });
};

/**
 * 导出全部日期拓展数据。
 * @description 服务端返回 JSON 文件流（date-attributes.json），使用 blob 接收便于落地为文件。
 * @returns 文件二进制内容，可写入为 `date-attributes.json`。
 */
export const exportDateAttributes = (): Promise<Blob> => {
  return request({
    url: "/admin/date-attribute/export",
    method: "get",
    responseType: "blob"
  });
};

/**
 * 按公历日期导入并覆盖日期拓展字段。
 * @param file 符合 `DateAttributeRecord` 结构的 JSON 文件。
 */
export const importDateAttributes = (file: File): Promise<ImportDateAttributeResponse> => {
  const form = new FormData();
  form.append("file", file as Blob);

  return request({
    url: "/admin/date-attribute/import",
    method: "post",
    data: form
  });
};
