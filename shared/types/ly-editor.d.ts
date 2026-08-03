import type { NavigationWebsiteItem, SearchEngineItem, ShortcutItem } from "./navigation-website";
import type { ArticleCategory, ArticleCategoryForm } from "./article";
import type { HitokotoItem, HitokotoTypeItem } from "./hitokoto";
import type { NoteFolderForm } from "./note";
import type { ImageFolder } from "./image";
import type { AttachmentFolder } from "./attachment";
import type { WorkItem } from "./config";
import type { ApiKeyItem, CreatedApiKey } from "./api-key";

/**
 * 画布文档列表项（不含核心数据 data）
 * @description 与 CanvasDocumentListItem 结构保持一致，用于标签页数据传递
 */
export interface CanvasDocumentItem {
  id: number;
  created_at: string | null;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
  type: string;
  title: string;
  description: string | null;
  cover: string | null;
  status: number;
}

/** 白板列表项 */
export type WhiteboardItem = CanvasDocumentItem;

/** 看板列表项 */
export type KanbanItem = CanvasDocumentItem;

/** 流程图列表项 */
export type FlowchartItem = CanvasDocumentItem;

/** 思维导图列表项 */
export type MindmapItem = CanvasDocumentItem;

export interface NoteData {
  id?: number;
  folder_id?: number;
  name: string;
  content: string;
}

export interface ImagePreviewData {
  url: string;
}

export type ImageManagerData = ImageFolder;

export type AttachmentManagerData = AttachmentFolder;

/** 白板标签页数据，使用列表项结构 */
export type WhiteboardPanelData = WhiteboardItem;

/** 看板标签页数据，使用列表项结构 */
export type KanbanPanelData = KanbanItem;

/** 流程图标签页数据，使用列表项结构 */
export type FlowchartPanelData = FlowchartItem;

/** 思维导图标签页数据，使用列表项结构 */
export type MindmapPanelData = MindmapItem;

export type EditorTabItem = {
  key: string;
  label: string;
  isChange?: boolean;
  openTime?: number;
  lastEditTime?: number;
} & (
  | {
      type: "note";
      data: NoteData;
    }
  | {
      type: "article-panel";
    }
  | {
      type: "image-preview";
    }
  | {
      type: "image-panel";
      data: ImageManagerData;
    }
  | {
      type: "attachment-panel";
      data: AttachmentManagerData;
    }
  | {
      type: "hitokoto-panel";
    }
  | {
      type: "dashboard-panel";
    }
  | {
      type: "cron-job-panel";
    }
  | {
      type: "setting-panel";
    }
  | {
      type: "user-panel";
    }
  | {
      type: "navigation-website-panel";
    }
  | {
      type: "navigation-history-panel";
    }
  | {
      type: "api-key-panel";
    }
  | {
      type: "whiteboard-panel";
      data: WhiteboardPanelData;
    }
  | {
      type: "kanban-panel";
      data: KanbanPanelData;
    }
);

export type FolderTreeItem = {
  key: string; // 生成的唯一标识符,资源类型+ID
  id: number; // 资源ID,可能会重复
  name: string; // 显示在目录中的
  is_folder?: boolean;
  created_at?: number;
  updated_at?: number;
  children?: FolderTreeItem[];
  parent_id?: number;
} & (
  | {
      type: "folder";
      data: object;
    }
  | {
      type: "note";
      data: {
        is_published?: boolean;
        article_id?: number;
        extension: string;
      };
    }
);

// export type EditorTabList = EditorTabItem<NoteData>[];

// export type MonacoEditorSaveFileEvent = EditorTabItem<NoteData> & {
//   silent?: boolean;
//   closeTab?: boolean;
// };

// export interface ExplorerNewFolderEvent {
//   parent?: number;
// }

// export interface ExplorerRenameFolderEvent {
//   id: number;
//   parent?: number;
//   name: string;
// }

// export interface ExplorerRenameFileEvent {
//   id: number;
//   filename: string;
// }

export interface ActivityMenuItem {
  key: string;
  label: string;
  icon: string;
  panel?: EditorTabItem["type"];
  onClick?: () => void;
}

/**
 * LY Editor 弹窗唯一标识。
 */
export type LyEditorModalKey =
  | "note-folder-form"
  | "note-save"
  | "note-publish"
  | "category-form"
  | "category-details"
  | "shortcut-form"
  | "search-engine-form"
  | "navigation-website-form"
  | "navigation-website-import"
  | "notice-manager"
  | "send-email"
  | "work-form"
  | "image-folder-form"
  | "attachment-folder-form"
  | "hitokoto-form"
  | "hitokoto-import"
  | "hitokoto-type-form"
  | "hitokoto-type-details"
  | "api-key-form"
  | "api-key-created"
  | "whiteboard-form"
  | "kanban-form"
  | "flowchart-form"
  | "mindmap-form";

/**
 * LY Editor 弹窗参数映射。
 */
export type HitokotoFormModalPayload = {
  mode: "create" | "update";
  record?: HitokotoItem;
};

export type AttachmentFolderFormModalPayload = {
  mode: "create" | "update";
  record?: AttachmentFolder;
};

export type AttachmentFolderFormModalResult = { action: "submitted" } | { action: "cancelled" };

export type HitokotoFormModalResult = { action: "submitted" } | { action: "cancelled" };

export type HitokotoImportModalResult = { action: "imported" } | { action: "cancelled" };

export type HitokotoTypeFormModalPayload = {
  mode: "create" | "update";
  record?: HitokotoTypeItem;
};

export type HitokotoTypeFormModalResult = { action: "submitted" } | { action: "cancelled" };

export type HitokotoTypeDetailsModalPayload = { record: HitokotoTypeItem };

export type HitokotoTypeDetailsModalResult = { action: "closed" } | { action: "cancelled" };

/**
 * 项目表单弹窗参数。
 */
export type WorkFormModalPayload = {
  mode: "create" | "update";
  record?: WorkItem;
  works: WorkItem[];
};

/**
 * 项目表单弹窗结果。
 */
export type WorkFormModalResult = { action: "submitted" } | { action: "cancelled" };

/**
 * 导航网站表单弹窗参数。
 */
export type NavigationWebsiteFormModalPayload = {
  mode: "create" | "update";
  record?: NavigationWebsiteItem;
};

/**
 * 导航网站表单弹窗结果。
 */
export type NavigationWebsiteFormModalResult = { action: "submitted" } | { action: "cancelled" };

/**
 * 导航网站导入弹窗结果。
 */
export type NavigationWebsiteImportModalResult = { action: "imported" } | { action: "cancelled" };

/**
 * API Key 表单弹窗参数。
 */
export type ApiKeyFormModalPayload = {
  mode: "create" | "update";
  record?: ApiKeyItem;
};

/**
 * API Key 表单弹窗结果。
 */
export type ApiKeyFormModalResult =
  { action: "submitted"; data?: CreatedApiKey } | { action: "cancelled" };

/**
 * Secret API Key 明文展示弹窗参数。
 */
export type ApiKeyCreatedModalPayload = {
  record: CreatedApiKey;
};

/**
 * Secret API Key 明文展示弹窗结果。
 */
export type ApiKeyCreatedModalResult = { action: "closed" } | { action: "cancelled" };

/**
 * 白板表单弹窗参数。
 */
export type WhiteboardFormModalPayload = {
  mode: "create" | "update";
  record?: WhiteboardItem;
};

/**
 * 白板表单弹窗结果。
 */
export type WhiteboardFormModalResult = { action: "submitted" } | { action: "cancelled" };

/**
 * 看板表单弹窗参数。
 */
export type KanbanFormModalPayload = {
  mode: "create" | "update";
  record?: KanbanItem;
};

/**
 * 看板表单弹窗结果。
 */
export type KanbanFormModalResult = { action: "submitted" } | { action: "cancelled" };

/**
 * 流程图表单弹窗参数。
 */
export type FlowchartFormModalPayload = {
  mode: "create" | "update";
  record?: FlowchartItem;
};

/**
 * 流程图表单弹窗结果。
 */
export type FlowchartFormModalResult = { action: "submitted" } | { action: "cancelled" };

/**
 * 思维导图表单弹窗参数。
 */
export type MindmapFormModalPayload = {
  mode: "create" | "update";
  record?: MindmapItem;
};

/**
 * 思维导图表单弹窗结果。
 */
export type MindmapFormModalResult = { action: "submitted" } | { action: "cancelled" };

export type LyEditorModalPayloadMap = {
  "note-folder-form": { form?: NoteFolderForm };
  "note-save": { tab: EditorTabItem };
  "note-publish": { node: FolderTreeItem };
  "category-form": { form?: ArticleCategoryForm };
  "category-details": { category: ArticleCategory };
  "shortcut-form": { record?: ShortcutItem };
  "search-engine-form": { record?: SearchEngineItem };
  "navigation-website-form": NavigationWebsiteFormModalPayload;
  "navigation-website-import": undefined;
  "notice-manager": undefined;
  "send-email": undefined;
  "work-form": WorkFormModalPayload;
  "image-folder-form": { record?: ImageFolder };
  "attachment-folder-form": AttachmentFolderFormModalPayload;
  "hitokoto-form": HitokotoFormModalPayload;
  "hitokoto-import": undefined;
  "hitokoto-type-form": HitokotoTypeFormModalPayload;
  "hitokoto-type-details": HitokotoTypeDetailsModalPayload;
  "api-key-form": ApiKeyFormModalPayload;
  "api-key-created": ApiKeyCreatedModalPayload;
  "whiteboard-form": WhiteboardFormModalPayload;
  "kanban-form": KanbanFormModalPayload;
  "flowchart-form": FlowchartFormModalPayload;
  "mindmap-form": MindmapFormModalPayload;
};

/**
 * LY Editor 弹窗返回结果映射。
 */
export type LyEditorModalResultMap = {
  "note-folder-form": { action: "submitted" } | { action: "cancelled" };
  "note-save": { action: "saved"; tab: EditorTabItem } | { action: "cancelled" };
  "note-publish": { action: "published"; articleId?: number } | { action: "cancelled" };
  "category-form": { action: "submitted"; data?: ArticleCategory } | { action: "cancelled" };
  "category-details": { action: "closed" } | { action: "cancelled" };
  "shortcut-form": { action: "submitted" } | { action: "cancelled" };
  "search-engine-form": { action: "submitted" } | { action: "cancelled" };
  "navigation-website-form": NavigationWebsiteFormModalResult;
  "navigation-website-import": NavigationWebsiteImportModalResult;
  "notice-manager": { action: "saved" } | { action: "cancelled" };
  "send-email": { action: "sent" } | { action: "cancelled" };
  "work-form": WorkFormModalResult;
  "image-folder-form": { action: "submitted" } | { action: "cancelled" };
  "attachment-folder-form": AttachmentFolderFormModalResult;
  "hitokoto-form": HitokotoFormModalResult;
  "hitokoto-import": HitokotoImportModalResult;
  "hitokoto-type-form": HitokotoTypeFormModalResult;
  "hitokoto-type-details": HitokotoTypeDetailsModalResult;
  "api-key-form": ApiKeyFormModalResult;
  "api-key-created": ApiKeyCreatedModalResult;
  "whiteboard-form": WhiteboardFormModalResult;
  "kanban-form": KanbanFormModalResult;
  "flowchart-form": FlowchartFormModalResult;
  "mindmap-form": MindmapFormModalResult;
};

/**
 * 工作台面板注册项。
 */
export type LyEditorPanelRegistryItem = {
  component: Component;
  keepAlive?: boolean;
};
