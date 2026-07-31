/**
 * 画布文档类型枚举
 * @description 定义画布文档的板块类型，data 结构由前端组件按类型自治
 */
export const CanvasDocumentTypeEnum = {
  /** 看板 */
  KANBAN: "kanban",
  /** 白板 */
  WHITEBOARD: "whiteboard"
} as const;

/** 画布文档类型 */
export type CanvasDocumentType =
  (typeof CanvasDocumentTypeEnum)[keyof typeof CanvasDocumentTypeEnum];

/** 画布文档类型值列表 */
export const CANVAS_DOCUMENT_TYPES = Object.values(CanvasDocumentTypeEnum);
