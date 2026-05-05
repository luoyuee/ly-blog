<script setup lang="ts">
import { EditorCore } from "../core";
import { useLyEditorStore } from "@/stores";
import { lyEditorPanelRegistry } from "../registry/panels";

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

const getPanelComponent = (type: string) => {
  return lyEditorPanelRegistry[type]?.component;
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
