<script setup lang="ts">
import { useMdcEditorStore } from "@/stores";
import { ResizeArea } from "@/components/resize-area";

const editorStore = useMdcEditorStore();
</script>
<template>
  <div class="mdc-editor-preview">
    <ResizeArea
      class="h-full"
      position="left"
      v-show="editorStore.preview.show"
      :maxWidth="600"
    >
      <div class=""></div>
    </ResizeArea>
  </div>
</template>
<style scoped lang="scss">
.mdc-editor-preview {
  display: flex;
}
</style>
