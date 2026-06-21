import type { NavigationWebsiteItem, SearchEngineItem, ShortcutItem } from "./navigation-website";
import type { ArticleCategory, ArticleCategoryForm } from "./article";
import type { HitokotoItem, HitokotoTypeItem } from "./hitokoto";
import type { NoteFolderForm } from "./note";
import type { ImageFolder } from "./image";
import type { AttachmentFolder } from "./attachment";
import type { WorkItem } from "./config";
import type { ApiKeyItem, CreatedApiKey } from "./api-key";

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
);

export type FolderTreeItem = {
  key: string; // 生成的唯一标识符,资源类型+ID
  id: number; // 资源ID,可能会重复
  name: string; // 显示在目录中的
  is_folder?: boolean;
  is_expanded?: boolean;
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
  | "api-key-created";

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

export type HitokotoTypeDetailsModalPayload = HitokotoTypeItem;

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
  | { action: "submitted"; data?: CreatedApiKey }
  | { action: "cancelled" };

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

export type LyEditorModalPayloadMap = {
  "note-folder-form": NoteFolderForm | undefined;
  "note-save": EditorTabItem;
  "note-publish": FolderTreeItem;
  "category-form": ArticleCategoryForm | undefined;
  "category-details": ArticleCategory;
  "shortcut-form": ShortcutItem | undefined;
  "search-engine-form": SearchEngineItem | undefined;
  "navigation-website-form": NavigationWebsiteFormModalPayload;
  "notice-manager": undefined;
  "send-email": undefined;
  "work-form": WorkFormModalPayload;
  "image-folder-form": ImageFolder | undefined;
  "attachment-folder-form": AttachmentFolderFormModalPayload;
  "hitokoto-form": HitokotoFormModalPayload;
  "hitokoto-import": undefined;
  "hitokoto-type-form": HitokotoTypeFormModalPayload;
  "hitokoto-type-details": HitokotoTypeDetailsModalPayload;
  "api-key-form": ApiKeyFormModalPayload;
  "api-key-created": ApiKeyCreatedModalPayload;
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
};

/**
 * 当前LY Editor 弹窗描述。
 */
export type LyEditorModalItem = {
  id: string;
  key: LyEditorModalKey;
  payload?: unknown;
};

/**
 * 工作台面板注册项。
 */
export type LyEditorPanelRegistryItem = {
  component: Component;
  keepAlive?: boolean;
};
