import type { LyEditorModalKey } from "#shared/types/ly-editor";
import type { Component } from "vue";

import {
  AccessTokenCreatedModal,
  AccessTokenFormModal,
  AttachmentFolderFormModal,
  CategoryDetailsModal,
  CategoryFormModal,
  HitokotoFormModal,
  HitokotoImportModal,
  HitokotoTypeDetailsModal,
  HitokotoTypeFormModal,
  ImageFolderFormModal,
  NavigationWebsiteFormModal,
  NoticeManagerModal,
  NoteFolderFormModal,
  NotePublishModal,
  NoteSaveModal,
  SearchEngineFormModal,
  SendEmailModal,
  ShortcutFormModal,
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
  "access-token-form": AccessTokenFormModal,
  "access-token-created": AccessTokenCreatedModal,
  "navigation-website-form": NavigationWebsiteFormModal,
  "notice-manager": NoticeManagerModal,
  "note-folder-form": NoteFolderFormModal,
  "note-publish": NotePublishModal,
  "note-save": NoteSaveModal,
  "work-form": WorkFormModal,
  "send-email": SendEmailModal
} satisfies Partial<Record<LyEditorModalKey, Component>>;
