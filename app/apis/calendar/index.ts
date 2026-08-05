import type {
  ClearDateAttributeResponse,
  DateAttributeRecord,
  ImportDateAttributeResponse
} from "./models";
import { serviceAxios } from "@/utils/request";

/**
 * 日期拓展数据接口封装。
 * @description 对应服务端 `server/api/admin/date-attribute` 目录下的接口。
 */

/**
 * 清空全部日期拓展数据。
 */
export async function clearDateAttributes(): Promise<ClearDateAttributeResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/date-attribute/clear",
      method: "delete"
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 导出全部日期拓展数据。
 * @description 服务端返回 JSON 文件流（date-attributes.json），使用 blob 接收便于落地为文件。
 * @returns 文件二进制内容，可写入为 `date-attributes.json`。
 */
export async function exportDateAttributes(): Promise<Blob> {
  try {
    const response = await serviceAxios({
      url: "/admin/date-attribute/export",
      method: "get",
      responseType: "blob"
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 按公历日期导入并覆盖日期拓展字段。
 * @param file 符合 `DateAttributeRecord` 结构的 JSON 文件。
 */
export async function importDateAttributes(file: File): Promise<ImportDateAttributeResponse> {
  try {
    const form = new FormData();
    form.append("file", file as Blob);

    const response = await serviceAxios({
      url: "/admin/date-attribute/import",
      method: "post",
      data: form
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export type { DateAttributeRecord };
