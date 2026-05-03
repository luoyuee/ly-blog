<script setup lang="ts">
// import { initEditor } from "./editor";
import { onBeforeUnmount, onMounted, useTemplateRef } from "vue";
import monacoLoader from "@monaco-editor/loader";

const monacoEditorRef = useTemplateRef("monacoEditorRef");
let disposeEditor: (() => void) | undefined;

onMounted(async () => {
  if (monacoEditorRef.value) {
    // const monacoPackage = await import("monaco-editor");

    // monacoLoader.config();

    const monaco = await monacoLoader.init();

    const monacoEditor = monaco.editor.create(monacoEditorRef.value, {
      language: "mdc",
      theme: "vs-dark",
      model: null,
      automaticLayout: true
    });

    // initEditor(monacoEditorRef.value).then((editor) => {
    //   if (!editor) return;

    //   disposeEditor = () => {
    //     editor.dispose();
    //   };
    // });
  }
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
