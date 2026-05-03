<script setup lang="ts">
import { useLyEditorStore } from "@/stores";
import { ResizeArea } from "@/components/resize-area";
import { LyEditorActivityMenu } from "#shared/constants";

import {
  ArticleManager,
  HitokotoManager,
  ImageManager,
  NavigationWebsiteManager,
  NoteManager,
  WorkManager
} from "../modules";

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
      <NavigationWebsiteManager
        v-else-if="lyEditorStore.sidebar.active === LyEditorActivityMenu.NavigationWebsiteManager"
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
