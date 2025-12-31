<script setup lang="ts">
import { useLyEditorStore } from "@/stores";
import { ResizeArea } from "@/components/resize-area";
import { LyEditorActivityMenu } from "#shared/constants";

import ArticleManager from "./components/article-manager/ArticleManager.vue";
import NoteManager from "./components/note-manager/NoteManager.vue";
import ImageManager from "./components/image-manager/ImageManager.vue";
import HitokotoManager from "./components/hitokoto-manager/HitokotoManager.vue";
import WorkManager from "./components/work-manager/WorkManager.vue";

const lyEditorStore = useLyEditorStore();
</script>
<template>
  <div class="ly-editor__sidebar">
    <ResizeArea
      v-show="lyEditorStore.sidebar.show"
      position="right"
      class="h-full"
      :width="280"
      :max-width="400"
    >
      <NoteManager v-show="lyEditorStore.sidebar.active === LyEditorActivityMenu.NoteManager" />

      <ArticleManager v-if="lyEditorStore.sidebar.active === LyEditorActivityMenu.ArticleManager" />
      <ImageManager
        v-else-if="lyEditorStore.sidebar.active === LyEditorActivityMenu.ImageManager"
      />
      <HitokotoManager
        v-else-if="lyEditorStore.sidebar.active === LyEditorActivityMenu.HitokotoManager"
      />
      <WorkManager v-else-if="lyEditorStore.sidebar.active === LyEditorActivityMenu.WorkManager" />
    </ResizeArea>
  </div>
</template>
<style scoped lang="scss">
.ly-editor__sidebar {
  flex-shrink: 0;
  background-color: var(--ly-editor-sidebar-background);
  overflow: hidden;
}
</style>
