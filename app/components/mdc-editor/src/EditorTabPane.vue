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

const hasEditorCore = computed(() => {
  return !!mdcEditorStore.tabs.find((item) => item.type === "markdown");
});

const currentTab = computed(() => {
  return mdcEditorStore.tabs.find(
    (item) => item.key === mdcEditorStore.currenTab
  );
});
</script>
<template>
  <div class="overflow-hidden">
    <!-- <EditorCore /> -->

    <ImageFolderPane
      v-for="item in ImageFolderPanes"
      :key="item.key"
      :tab="item"
      v-show="mdcEditorStore.currenTab === item.key"
    />

    <HitokotoPaneContent
      v-if="hasHitokotoPane"
      v-show="mdcEditorStore.currenTab === 'hitokoto-manager'"
    />

    <SettingPlane
      v-if="hasSettingPane"
      v-show="mdcEditorStore.currenTab === 'setting-pane'"
    />
  </div>
</template>
