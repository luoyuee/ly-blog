import type { Component } from "vue";
import { LyEditorActivityMenuEnum } from "#shared/enums";

import {
  AccessTokenManager,
  AttachmentManager,
  NoteManager,
  ArticleManager,
  HitokotoManager,
  ImageManager,
  NavigationWebsiteManager,
  WorkManager
} from "../modules";

/**
 * 编辑器侧边栏注册项。
 */
type LyEditorSidebarRegistryItem = {
  component: Component;
};

/**
 * 编辑器侧边栏注册表。
 */
export const lyEditorSidebarRegistry = {
  [LyEditorActivityMenuEnum.NoteManager]: {
    component: NoteManager
  },
  [LyEditorActivityMenuEnum.ArticleManager]: {
    component: ArticleManager
  },
  [LyEditorActivityMenuEnum.ImageManager]: {
    component: ImageManager
  },
  [LyEditorActivityMenuEnum.AttachmentManager]: {
    component: AttachmentManager
  },
  [LyEditorActivityMenuEnum.HitokotoManager]: {
    component: HitokotoManager
  },
  [LyEditorActivityMenuEnum.NavigationManager]: {
    component: NavigationWebsiteManager
  },
  [LyEditorActivityMenuEnum.WorkManager]: {
    component: WorkManager
  },
  [LyEditorActivityMenuEnum.AccessTokenManager]: {
    component: AccessTokenManager
  }
} satisfies Record<string, LyEditorSidebarRegistryItem>;

/**
 * 编辑器侧边栏菜单键。
 */
export type LyEditorSidebarMenuKey = keyof typeof lyEditorSidebarRegistry;
