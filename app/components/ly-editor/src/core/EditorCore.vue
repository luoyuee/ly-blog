<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from "vue";
import { initEditor } from "./editor";

const monacoEditorRef = useTemplateRef("monacoEditorRef");
let disposeEditor: (() => void) | undefined;

onMounted(async () => {
  if (!monacoEditorRef.value) return;

  const editor = await initEditor(monacoEditorRef.value);
  if (!editor) return;

  disposeEditor = () => {
    editor.dispose();
  };
});

onBeforeUnmount(() => {
  disposeEditor?.();
});
</script>
<template>
  <div class="monaco-editor-wrap">
    <div id="monaco-editor" ref="monacoEditorRef"></div>
  </div>
</template>
<style lang="scss">
.editor-close-msg-box {
  .el-message-box__container {
    i.el-icon.el-message-box__status {
      width: 40px;
      height: 40px;
      line-height: 1;
    }
  }
}
</style>
<style scoped lang="scss">
.monaco-editor-wrap {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;

  #monaco-editor {
    width: 100%;
    height: calc(100vh - 105px);
  }
}
</style>
