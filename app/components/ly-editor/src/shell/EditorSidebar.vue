<script setup lang="ts">
import type { Component } from "vue";
import { useLyEditorStore } from "@/stores";
import { LyEditorActivityMenu } from "#shared/constants";

import {
  NoteManager,
  ArticleManager,
  HitokotoManager,
  ImageManager,
  NavigationWebsiteManager,
  WorkManager
} from "../modules";

const lyEditorStore = useLyEditorStore();

type SidebarMenuKey =
  | (typeof LyEditorActivityMenu)["NoteManager"]
  | (typeof LyEditorActivityMenu)["ArticleManager"]
  | (typeof LyEditorActivityMenu)["ImageManager"]
  | (typeof LyEditorActivityMenu)["HitokotoManager"]
  | (typeof LyEditorActivityMenu)["NavigationManager"]
  | (typeof LyEditorActivityMenu)["WorkManager"];

type SidebarPaneRegistryItem = {
  key: SidebarMenuKey;
  component: Component;
};

const sidebarPaneRegistry: SidebarPaneRegistryItem[] = [
  {
    key: LyEditorActivityMenu.NoteManager,
    component: NoteManager
  },
  {
    key: LyEditorActivityMenu.ArticleManager,
    component: ArticleManager
  },
  {
    key: LyEditorActivityMenu.ImageManager,
    component: ImageManager
  },
  {
    key: LyEditorActivityMenu.HitokotoManager,
    component: HitokotoManager
  },
  {
    key: LyEditorActivityMenu.NavigationManager,
    component: NavigationWebsiteManager
  },
  {
    key: LyEditorActivityMenu.WorkManager,
    component: WorkManager
  }
];

const sidebarPaneMap = Object.fromEntries(
  sidebarPaneRegistry.map((item) => [item.key, item.component])
) as Record<SidebarMenuKey, Component>;

const currentSidebarKey = computed<SidebarMenuKey | null>(() => {
  const activeMenu = lyEditorStore.sidebar.active;

  if (!activeMenu || !(activeMenu in sidebarPaneMap)) {
    return null;
  }

  return activeMenu as SidebarMenuKey;
});

const currentSidebarComponent = computed<Component | null>(() => {
  if (!currentSidebarKey.value) {
    return null;
  }

  return sidebarPaneMap[currentSidebarKey.value];
});
</script>

<template>
  <div class="ly-editor__sidebar">
    <KeepAlive>
      <component :is="currentSidebarComponent" />
    </KeepAlive>
  </div>
</template>

<style scoped lang="scss">
.ly-editor__sidebar {
  flex-shrink: 0;
  background-color: var(--ly-editor-sidebar-background);
  overflow: hidden;
}
</style>
