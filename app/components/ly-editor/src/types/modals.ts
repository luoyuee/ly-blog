import type { ArticleCategory, ArticleCategoryForm } from "#shared/types/article";
import type { WorkItem } from "#shared/types/config";
import type { FolderTreeItem, EditorTabItem } from "#shared/types/ly-editor";
import type { ImageFolder } from "#shared/types/image";
import type { NavigationWebsiteItem, SearchEngineItem, ShortcutItem } from "#shared/types/navigation-website";
import type { NoteFolderForm } from "#shared/types/note";
import type { HitokotoItem, HitokotoTypeItem } from "#shared/types/hitokoto";

/**
 * 工作台弹窗唯一标识。
 */
export type WorkspaceModalKey =
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
  | "hitokoto-form"
  | "hitokoto-import"
  | "hitokoto-type-form"
  | "hitokoto-type-details";

/**
 * 工作台弹窗参数映射。
 */
export type WorkspaceModalPayloadMap = {
  "note-folder-form": NoteFolderForm | undefined;
  "note-save": EditorTabItem;
  "note-publish": FolderTreeItem;
  "category-form": ArticleCategoryForm | undefined;
  "category-details": ArticleCategory;
  "shortcut-form": ShortcutItem | undefined;
  "search-engine-form": SearchEngineItem | undefined;
  "navigation-website-form": NavigationWebsiteItem | undefined;
  "notice-manager": undefined;
  "send-email": undefined;
  "work-form": {
    item?: WorkItem;
    works: WorkItem[];
  };
  "image-folder-form": ImageFolder | undefined;
  "hitokoto-form": HitokotoItem | undefined;
  "hitokoto-import": undefined;
  "hitokoto-type-form": HitokotoTypeItem | undefined;
  "hitokoto-type-details": HitokotoTypeItem;
};

/**
 * 工作台弹窗返回结果映射。
 */
export type WorkspaceModalResultMap = {
  "note-folder-form": { action: "submitted" } | { action: "cancelled" };
  "note-save": { action: "saved"; tab: EditorTabItem } | { action: "cancelled" };
  "note-publish": { action: "published"; articleId?: number } | { action: "cancelled" };
  "category-form": { action: "submitted"; data?: ArticleCategory } | { action: "cancelled" };
  "category-details": { action: "closed" } | { action: "cancelled" };
  "shortcut-form": { action: "submitted" } | { action: "cancelled" };
  "search-engine-form": { action: "submitted" } | { action: "cancelled" };
  "navigation-website-form": { action: "submitted" } | { action: "cancelled" };
  "notice-manager": { action: "saved" } | { action: "cancelled" };
  "send-email": { action: "sent" } | { action: "cancelled" };
  "work-form": { action: "submitted" } | { action: "cancelled" };
  "image-folder-form": { action: "submitted" } | { action: "cancelled" };
  "hitokoto-form": { action: "submitted" } | { action: "cancelled" };
  "hitokoto-import": { action: "imported" } | { action: "cancelled" };
  "hitokoto-type-form": { action: "submitted" } | { action: "cancelled" };
  "hitokoto-type-details": { action: "closed" } | { action: "cancelled" };
};

/**
 * 当前活动弹窗描述。
 */
export type WorkspaceModalItem = {
  id: string;
  key: WorkspaceModalKey;
  payload?: unknown;
};
