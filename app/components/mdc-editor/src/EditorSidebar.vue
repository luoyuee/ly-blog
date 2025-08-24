<script setup lang="ts">
import { useMdcEditorStore } from "@/stores";
import { ResizeArea } from "@/components/resize-area";
import { MdcEditorActivityMenu } from "#shared/constants";

import ArticleManager from "./components/article-manager/ArticleManager.vue";
import NoteManager from "./components/note-manager/NoteManager.vue";
import ImageManager from "./components/image-manager/ImageManager.vue";
import HitokotoManager from "./components/hitokoto-manager/HitokotoManager.vue";

const editorStore = useMdcEditorStore();
</script>
<template>
  <div class="mdc-editor-sidebar">
    <ResizeArea
      v-show="editorStore.sidebar.show"
      position="right"
      class="h-full"
      :width="280"
      :max-width="400"
    >
      <ArticleManager v-if="editorStore.sidebar.active === MdcEditorActivityMenu.ArticleManager" />
      <NoteManager v-else-if="editorStore.sidebar.active === MdcEditorActivityMenu.NoteManager" />
      <ImageManager v-else-if="editorStore.sidebar.active === MdcEditorActivityMenu.ImageManager" />
      <HitokotoManager
        v-else-if="editorStore.sidebar.active === MdcEditorActivityMenu.HitokotoManager"
      />
    </ResizeArea>
  </div>
</template>
<style scoped lang="scss">
.mdc-editor-sidebar {
  // border-right: 1px solid #2b2b2b;
  flex-shrink: 0;
  background-color: var(--mdc-editor-sidebar-background);
  overflow: hidden;
}
</style>
