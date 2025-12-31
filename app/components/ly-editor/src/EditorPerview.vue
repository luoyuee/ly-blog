<script setup lang="ts">
import { useLyEditorStore } from "@/stores";
import { ResizeArea } from "@/components/resize-area";

const editorStore = useLyEditorStore();
</script>
<template>
  <div class="ly-editor-preview">
    <ResizeArea v-show="editorStore.preview.show" class="h-full" position="left" :max-width="600">
      <div class=""></div>
    </ResizeArea>
  </div>
</template>
<style scoped lang="scss">
.ly-editor-preview {
  display: flex;
}
</style>
