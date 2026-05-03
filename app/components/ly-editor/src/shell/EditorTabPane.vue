<script setup lang="ts">
import { EditorCore } from "../core";
import { useLyEditorStore } from "@/stores";
import { LyEditorTabPanelEnum } from "@@/shared/enums";
import { workspacePanelRegistry } from "../workspace/panels";

const lyEditorStore = useLyEditorStore();

const imagePanelTabs = computed(() => {
  return lyEditorStore.tabs.filter((item) => item.type === LyEditorTabPanelEnum.ImagePanel);
});

const singletonPanelTabs = computed(() => {
  return lyEditorStore.tabs.filter((item) => {
    return item.type !== "note" && item.type !== LyEditorTabPanelEnum.ImagePanel;
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
  return workspacePanelRegistry[type]?.component;
};
</script>

<template>
  <div class="overflow-hidden">
    <EditorCore v-show="showEditorCore" />

    <component
      :is="getPanelComponent(item.type)"
      v-for="item in imagePanelTabs"
      v-show="lyEditorStore.currentTab === item.key"
      :key="item.key"
      :tab="item"
    />

    <component
      :is="getPanelComponent(item.type)"
      v-for="item in singletonPanelTabs"
      v-show="lyEditorStore.currentTab === item.key"
      :key="item.key"
      :tab="item"
    />
  </div>
</template>
