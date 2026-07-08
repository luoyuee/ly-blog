<script setup lang="ts">
import type { LyEditorPanelKey } from "@ly-editor/src/registry/panels";
import { lyEditorPanelRegistry } from "@ly-editor/src/registry/panels";
import { EditorCore } from "@ly-editor/src/core";
import { useLyEditorStore } from "@/stores";

const lyEditorStore = useLyEditorStore();

const tabs = computed(() => {
  return lyEditorStore.tabs.filter((item) => {
    return item.type !== "note";
  });
});

const showEditorCore = computed(() => {
  const currentTabItem = lyEditorStore.getCurrentTabItem();
  if (currentTabItem) {
    return currentTabItem.type === "note";
  }

  return false;
});

const isLyEditorPanelKey = (type: string): type is LyEditorPanelKey => {
  return type in lyEditorPanelRegistry;
};

const getPanelComponent = (type: string) => {
  return isLyEditorPanelKey(type) ? lyEditorPanelRegistry[type].component : undefined;
};
</script>

<template>
  <div class="overflow-hidden">
    <EditorCore v-show="showEditorCore" />

    <component
      :is="getPanelComponent(item.type)"
      v-for="item in tabs"
      v-show="lyEditorStore.currentTab === item.key"
      :key="item.key"
      :tab="item"
    />
  </div>
</template>
