<script setup lang="ts">
import type { LyEditorSidebarMenuKey } from "../registry";
import { lyEditorSidebarRegistry } from "../registry";
import { useLyEditorStore } from "@/stores";

const lyEditorStore = useLyEditorStore();

/**
 * 判断当前激活菜单是否已注册为侧边栏面板。
 */
const isSidebarMenuKey = (menu: string): menu is LyEditorSidebarMenuKey => {
  return menu in lyEditorSidebarRegistry;
};

const currentSidebarKey = computed<LyEditorSidebarMenuKey | null>(() => {
  const activeMenu = lyEditorStore.sidebar.active;

  if (!activeMenu || !isSidebarMenuKey(activeMenu)) {
    return null;
  }

  return activeMenu;
});

const currentSidebarComponent = computed(() => {
  if (!currentSidebarKey.value) {
    return null;
  }

  return lyEditorSidebarRegistry[currentSidebarKey.value].component;
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
