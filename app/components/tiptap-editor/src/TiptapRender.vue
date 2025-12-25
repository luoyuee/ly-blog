<template>
  <client-only>
    <template #fallback>
      <div class="h-[60px]"></div>
    </template>
    <div class="tiptap-editor render">
      <div class="tiptap-editor__container">
        <editor-content class="tiptap-editor__container-content" :editor="editor" />
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { useLowlight } from "./hooks/useLowlight";
import { useExtensions } from "./hooks/useExtensions";

const modelValue = defineModel<string>({ default: "" });

const lowlight = useLowlight();

const extensions = useExtensions({
  placeholder: "",
  lowlight
});

const editor = useEditor({
  content: unref(modelValue),
  extensions,
  editable: false
});

watch(modelValue, (newVal) => {
  if (!editor.value) return;
  const isSame = editor.value.getHTML() === newVal;

  if (isSame) return;

  editor.value.commands.setContent(newVal);
});
</script>

<style lang="scss">
@import url("./styles/tiptap-editor.scss");
// 导入 highlight.js 样式
@import url("highlight.js/styles/atom-one-dark.css");

.tiptap-editor.render {
  min-height: unset;
}
</style>
