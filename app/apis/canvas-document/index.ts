import type {
  GetCanvasDocumentPaginatedRequest,
  GetCanvasDocumentPaginatedResponse,
  CreateCanvasDocumentRequest,
  UpdateCanvasDocumentRequest,
  CanvasDocumentDetail,
  CanvasDocumentListItem
} from "./models";
import { serviceAxios } from "@/utils/request";

/**
 * 画布文档（看板/白板）接口封装
 * @description 看板与白板共用同一套接口签名，仅路径不同；type 由服务端按路由固定，前端无需传递
 */

/** 分页查询看板列表 */
export async function getPaginatedKanbans(
  params: GetCanvasDocumentPaginatedRequest
): Promise<GetCanvasDocumentPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/canvas-document/kanban",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取看板详情（含核心数据 data） */
export async function getKanbanDetail(id: number): Promise<CanvasDocumentDetail> {
  try {
    const response = await serviceAxios({
      url: "/admin/canvas-document/kanban/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 创建看板 */
export async function createKanban(data: CreateCanvasDocumentRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/canvas-document/kanban",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 更新看板 */
export async function updateKanban(data: UpdateCanvasDocumentRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/canvas-document/kanban",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 删除看板（软删除） */
export async function deleteKanban(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/canvas-document/kanban/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取全部看板列表（不分页，不含核心数据 data） */
export async function getAllKanbans(): Promise<CanvasDocumentListItem[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/canvas-document/kanban/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 分页查询白板列表 */
export async function getPaginatedWhiteboards(
  params: GetCanvasDocumentPaginatedRequest
): Promise<GetCanvasDocumentPaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/canvas-document/whiteboard",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取白板详情（含核心数据 data） */
export async function getWhiteboardDetail(id: number): Promise<CanvasDocumentDetail> {
  try {
    const response = await serviceAxios({
      url: "/admin/canvas-document/whiteboard/" + id,
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 创建白板 */
export async function createWhiteboard(data: CreateCanvasDocumentRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/canvas-document/whiteboard",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 更新白板 */
export async function updateWhiteboard(data: UpdateCanvasDocumentRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/canvas-document/whiteboard",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 删除白板（软删除） */
export async function deleteWhiteboard(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/canvas-document/whiteboard/" + id,
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 获取全部白板列表（不分页，不含核心数据 data） */
export async function getAllWhiteboards(): Promise<CanvasDocumentListItem[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/canvas-document/whiteboard/all",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
