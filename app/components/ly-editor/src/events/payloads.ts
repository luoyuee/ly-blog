import type { ArticleCategory, ArticleCategoryForm } from "#shared/types/article";
import type { EditorTabItem, FolderTreeItem } from "#shared/types/ly-editor";
import type { NavigationWebsiteItem, SearchEngineItem, ShortcutItem } from "#shared/types/navigation-website";
import type { NoteFolderForm } from "#shared/types/note";

/**
 * 工作台事件 payload 类型映射。
 */
export type LyEditorEventPayloadMap = {
  "intent.note-manager:new:folder": undefined;
  "intent.note-manager:rename:folder": NoteFolderForm;
  "cmd.note-manager:reload": undefined;
  "cmd.note-manager:publish:article": FolderTreeItem;
  "intent.editor-core:save:file": EditorTabItem;
  "cmd.editor-core:new:file": undefined;
  "cmd.editor-core:open:file": EditorTabItem;
  "cmd.editor-core:close:file": EditorTabItem;
  "cmd.editor-core:switch:file": EditorTabItem;
  "cmd.editor-core:update:file": EditorTabItem;
  "cmd.editor-core:insert:card": undefined;
  "cmd.editor-core:inster:card": undefined;
  "editor-preview:preview:content": string;
  "cmd.article-manager:reload": undefined;
  "cmd.modal-manager:open:category-form": ArticleCategoryForm | undefined;
  "cmd.modal-manager:open:category-details": ArticleCategory;
  "cmd.modal-manager:open:shortcut-form": ShortcutItem | undefined;
  "cmd.modal-manager:open:search-engine-form": SearchEngineItem | undefined;
  "cmd.modal-manager:open:navigation-website-form": NavigationWebsiteItem | undefined;
  "notify.shortcut-form:submitted": undefined;
  "notify.search-engine-form:submitted": undefined;
  "notify.navigation-website-form:submitted": undefined;
};
