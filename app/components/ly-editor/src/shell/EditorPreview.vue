<script setup lang="ts">
import { useLyEditorStore } from "@/stores";
import { ResizeArea } from "@/components/resize-area";

const editorStore = useLyEditorStore();
</script>

<template>
  <div class="ly-editor-preview">
    <ResizeArea v-show="editorStore.preview.show" class="h-full" position="left" :max-width="600">
      <div class="ly-editor-preview__body">
        <MDC v-if="editorStore.preview.content" :value="editorStore.preview.content" />
        <div v-else class="ly-editor-preview__empty">暂无预览内容</div>
      </div>
    </ResizeArea>
  </div>
</template>

<style scoped lang="scss">
.ly-editor-preview {
  display: flex;

  &__body {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 16px;
    background-color: var(--ui-bg, #fff);
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    color: var(--ui-text-muted, #6b7280);
    font-size: 14px;
  }
}
</style>
