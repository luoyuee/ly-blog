import type { Component } from "vue";
import { LyEditorActivityMenu } from "#shared/constants";

import {
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
  [LyEditorActivityMenu.NoteManager]: {
    component: NoteManager
  },
  [LyEditorActivityMenu.ArticleManager]: {
    component: ArticleManager
  },
  [LyEditorActivityMenu.ImageManager]: {
    component: ImageManager
  },
  [LyEditorActivityMenu.HitokotoManager]: {
    component: HitokotoManager
  },
  [LyEditorActivityMenu.NavigationManager]: {
    component: NavigationWebsiteManager
  },
  [LyEditorActivityMenu.WorkManager]: {
    component: WorkManager
  }
} satisfies Record<string, LyEditorSidebarRegistryItem>;

/**
 * 编辑器侧边栏菜单键。
 */
export type LyEditorSidebarMenuKey = keyof typeof lyEditorSidebarRegistry;
