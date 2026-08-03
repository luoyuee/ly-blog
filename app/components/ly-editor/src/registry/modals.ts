import type { LyEditorModalKey } from "#shared/types/ly-editor";
import type { Component } from "vue";

import {
  ApiKeyCreatedModal,
  ApiKeyFormModal,
  AttachmentFolderFormModal,
  CategoryDetailsModal,
  CategoryFormModal,
  FlowchartFormModal,
  HitokotoFormModal,
  HitokotoImportModal,
  HitokotoTypeDetailsModal,
  HitokotoTypeFormModal,
  ImageFolderFormModal,
  KanbanFormModal,
  MindmapFormModal,
  NavigationWebsiteFormModal,
  NavigationWebsiteImportModal,
  NoticeManagerModal,
  NoteFolderFormModal,
  NotePublishModal,
  NoteSaveModal,
  SearchEngineFormModal,
  SendEmailModal,
  ShortcutFormModal,
  WhiteboardFormModal,
  WorkFormModal
} from "@ly-editor/src/modules";

/**
 * 工作台弹窗注册表。
 *
 * 具体组件会在迁移 modal 阶段逐步接入。
 */
export const lyEditorModalRegistry = {
  "category-form": CategoryFormModal,
  "category-details": CategoryDetailsModal,
  "hitokoto-form": HitokotoFormModal,
  "hitokoto-import": HitokotoImportModal,
  "hitokoto-type-form": HitokotoTypeFormModal,
  "hitokoto-type-details": HitokotoTypeDetailsModal,
  "image-folder-form": ImageFolderFormModal,
  "attachment-folder-form": AttachmentFolderFormModal,
  "shortcut-form": ShortcutFormModal,
  "search-engine-form": SearchEngineFormModal,
  "api-key-form": ApiKeyFormModal,
  "api-key-created": ApiKeyCreatedModal,
  "navigation-website-form": NavigationWebsiteFormModal,
  "navigation-website-import": NavigationWebsiteImportModal,
  "notice-manager": NoticeManagerModal,
  "note-folder-form": NoteFolderFormModal,
  "note-publish": NotePublishModal,
  "note-save": NoteSaveModal,
  "whiteboard-form": WhiteboardFormModal,
  "kanban-form": KanbanFormModal,
  "flowchart-form": FlowchartFormModal,
  "mindmap-form": MindmapFormModal,
  "work-form": WorkFormModal,
  "send-email": SendEmailModal
} satisfies Partial<Record<LyEditorModalKey, Component>>;
