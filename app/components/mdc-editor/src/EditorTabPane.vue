<script setup lang="ts">
import ImageFolderPane from "./components/image-manager/ImageFolderPane.vue";
import HitokotoPaneContent from "./components/hitokoto-manager/HitokotoPaneContent.vue";
import SettingPlane from "./components/SettingPlane.vue";
import { useMdcEditorStore } from "@/stores";
import EditorCore from "./components/core/EditorCore.vue";

const mdcEditorStore = useMdcEditorStore();

const ImageFolderPanes = computed(() => {
  return mdcEditorStore.tabs.filter((item) => item.type === "image-manager");
});

const hasHitokotoPane = computed(() => {
  return !!mdcEditorStore.tabs.find((item) => item.type === "hitokoto-manager");
});

const hasSettingPane = computed(() => {
  return !!mdcEditorStore.tabs.find((item) => item.type === "setting-pane");
});

const showEditorCore = computed(() => {
  const currentTabItem = mdcEditorStore.getCurrentTabItem();
  if (currentTabItem) {
    return currentTabItem.type === "note";
  }

  return false;
});

// const currentTab = computed(() => {
//   return mdcEditorStore.tabs.find((item) => item.key === mdcEditorStore.currenTab);
// });
</script>
<template>
  <div class="overflow-hidden">
    <EditorCore v-show="showEditorCore" />

    <ImageFolderPane
      v-for="item in ImageFolderPanes"
      v-show="mdcEditorStore.currenTab === item.key"
      :key="item.key"
      :tab="item"
    />

    <HitokotoPaneContent
      v-if="hasHitokotoPane"
      v-show="mdcEditorStore.currenTab === 'hitokoto-manager'"
    />

    <SettingPlane v-if="hasSettingPane" v-show="mdcEditorStore.currenTab === 'setting-pane'" />
  </div>
</template>
