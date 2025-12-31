<script setup lang="ts">
import ImageFolderPane from "./components/image-manager/ImageFolderPane.vue";
import HitokotoPaneContent from "./components/hitokoto-manager/HitokotoPaneContent.vue";
import SettingPlane from "./components/SettingPlane.vue";
import { useLyEditorStore } from "@/stores";
import EditorCore from "./components/core/EditorCore.vue";

const lyEditorStore = useLyEditorStore();

const ImageFolderPanes = computed(() => {
  return lyEditorStore.tabs.filter((item) => item.type === "image-manager");
});

const hasHitokotoPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === "hitokoto-manager");
});

const hasSettingPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === "setting-pane");
});

const showEditorCore = computed(() => {
  const currentTabItem = lyEditorStore.getCurrentTabItem();
  if (currentTabItem) {
    return currentTabItem.type === "note";
  }

  return false;
});

// const currentTab = computed(() => {
//   return lyEditorStore.tabs.find((item) => item.key === lyEditorStore.currentTab);
// });
</script>
<template>
  <div class="overflow-hidden">
    <EditorCore v-show="showEditorCore" />

    <ImageFolderPane
      v-for="item in ImageFolderPanes"
      v-show="lyEditorStore.currentTab === item.key"
      :key="item.key"
      :tab="item"
    />

    <HitokotoPaneContent
      v-if="hasHitokotoPane"
      v-show="lyEditorStore.currentTab === 'hitokoto-manager'"
    />

    <SettingPlane v-if="hasSettingPane" v-show="lyEditorStore.currentTab === 'setting-pane'" />
  </div>
</template>
