import type {
  GetCanvasDocumentPaginatedRequest,
  GetCanvasDocumentPaginatedResponse,
  CreateCanvasDocumentRequest,
  UpdateCanvasDocumentRequest,
  CanvasDocumentDetail,
  CanvasDocumentListItem
} from "./models";
import request from "@/utils/request";

/**
 * 画布文档（看板/白板/流程图/思维导图）接口封装
 * @description 各类型共用同一套接口签名，仅路径不同；type 由服务端按路由固定，前端无需传递
 */

/** 分页查询看板列表 */
export const getPaginatedKanbans = (
  params: GetCanvasDocumentPaginatedRequest
): Promise<GetCanvasDocumentPaginatedResponse> => {
  return request({
    url: "/admin/canvas-document/kanban",
    method: "get",
    params
  });
};

/** 获取看板详情（含核心数据 data） */
export const getKanbanDetail = (id: number): Promise<CanvasDocumentDetail> => {
  return request({
    url: "/admin/canvas-document/kanban/" + id,
    method: "get"
  });
};

/** 创建看板 */
export const createKanban = (data: CreateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/kanban",
    method: "post",
    data
  });
};

/** 更新看板 */
export const updateKanban = (data: UpdateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/kanban",
    method: "put",
    data
  });
};

/** 删除看板（软删除） */
export const deleteKanban = (id: number): Promise<void> => {
  return request({
    url: "/admin/canvas-document/kanban/" + id,
    method: "delete"
  });
};

/** 获取全部看板列表（不分页，不含核心数据 data） */
export const getAllKanbans = (): Promise<CanvasDocumentListItem[]> => {
  return request({
    url: "/admin/canvas-document/kanban/all",
    method: "get"
  });
};

/** 分页查询白板列表 */
export const getPaginatedWhiteboards = (
  params: GetCanvasDocumentPaginatedRequest
): Promise<GetCanvasDocumentPaginatedResponse> => {
  return request({
    url: "/admin/canvas-document/whiteboard",
    method: "get",
    params
  });
};

/** 获取白板详情（含核心数据 data） */
export const getWhiteboardDetail = (id: number): Promise<CanvasDocumentDetail> => {
  return request({
    url: "/admin/canvas-document/whiteboard/" + id,
    method: "get"
  });
};

/** 创建白板 */
export const createWhiteboard = (data: CreateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/whiteboard",
    method: "post",
    data
  });
};

/** 更新白板 */
export const updateWhiteboard = (data: UpdateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/whiteboard",
    method: "put",
    data
  });
};

/** 删除白板（软删除） */
export const deleteWhiteboard = (id: number): Promise<void> => {
  return request({
    url: "/admin/canvas-document/whiteboard/" + id,
    method: "delete"
  });
};

/** 获取全部白板列表（不分页，不含核心数据 data） */
export const getAllWhiteboards = (): Promise<CanvasDocumentListItem[]> => {
  return request({
    url: "/admin/canvas-document/whiteboard/all",
    method: "get"
  });
};

/** 分页查询流程图列表 */
export const getPaginatedFlowcharts = (
  params: GetCanvasDocumentPaginatedRequest
): Promise<GetCanvasDocumentPaginatedResponse> => {
  return request({
    url: "/admin/canvas-document/flowchart",
    method: "get",
    params
  });
};

/** 获取流程图详情（含核心数据 data） */
export const getFlowchartDetail = (id: number): Promise<CanvasDocumentDetail> => {
  return request({
    url: "/admin/canvas-document/flowchart/" + id,
    method: "get"
  });
};

/** 创建流程图 */
export const createFlowchart = (data: CreateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/flowchart",
    method: "post",
    data
  });
};

/** 更新流程图 */
export const updateFlowchart = (data: UpdateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/flowchart",
    method: "put",
    data
  });
};

/** 删除流程图（软删除） */
export const deleteFlowchart = (id: number): Promise<void> => {
  return request({
    url: "/admin/canvas-document/flowchart/" + id,
    method: "delete"
  });
};

/** 获取全部流程图列表（不分页，不含核心数据 data） */
export const getAllFlowcharts = (): Promise<CanvasDocumentListItem[]> => {
  return request({
    url: "/admin/canvas-document/flowchart/all",
    method: "get"
  });
};

/** 分页查询思维导图列表 */
export const getPaginatedMindmaps = (
  params: GetCanvasDocumentPaginatedRequest
): Promise<GetCanvasDocumentPaginatedResponse> => {
  return request({
    url: "/admin/canvas-document/mindmap",
    method: "get",
    params
  });
};

/** 获取思维导图详情（含核心数据 data） */
export const getMindmapDetail = (id: number): Promise<CanvasDocumentDetail> => {
  return request({
    url: "/admin/canvas-document/mindmap/" + id,
    method: "get"
  });
};

/** 创建思维导图 */
export const createMindmap = (data: CreateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/mindmap",
    method: "post",
    data
  });
};

/** 更新思维导图 */
export const updateMindmap = (data: UpdateCanvasDocumentRequest): Promise<void> => {
  return request({
    url: "/admin/canvas-document/mindmap",
    method: "put",
    data
  });
};

/** 删除思维导图（软删除） */
export const deleteMindmap = (id: number): Promise<void> => {
  return request({
    url: "/admin/canvas-document/mindmap/" + id,
    method: "delete"
  });
};

/** 获取全部思维导图列表（不分页，不含核心数据 data） */
export const getAllMindmaps = (): Promise<CanvasDocumentListItem[]> => {
  return request({
    url: "/admin/canvas-document/mindmap/all",
    method: "get"
  });
};
