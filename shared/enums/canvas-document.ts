/**
 * 画布文档类型枚举
 * @description 定义画布文档的板块类型，data 结构由前端组件按类型自治
 */
export const CanvasDocumentTypeEnum = {
  /** 看板 */
  KANBAN: "kanban",
  /** 白板 */
  WHITEBOARD: "whiteboard",
  /** 流程图 */
  FLOWCHART: "flowchart",
  /** 思维导图 */
  MINDMAP: "mindmap"
} as const;

/** 画布文档类型 */
export type CanvasDocumentType =
  (typeof CanvasDocumentTypeEnum)[keyof typeof CanvasDocumentTypeEnum];

/** 画布文档类型值列表 */
export const CANVAS_DOCUMENT_TYPES = Object.values(CanvasDocumentTypeEnum);

/**
 * 画布文档类型中文名称映射
 * @description 用于服务端提示信息反查中文名称，避免硬编码文案
 */
export const CanvasDocumentTypeLabelMap: Record<CanvasDocumentType, string> = {
  [CanvasDocumentTypeEnum.KANBAN]: "看板",
  [CanvasDocumentTypeEnum.WHITEBOARD]: "白板",
  [CanvasDocumentTypeEnum.FLOWCHART]: "流程图",
  [CanvasDocumentTypeEnum.MINDMAP]: "思维导图"
};
