<template>
  <client-only>
    <template #fallback>
      <div class="h-[200px]"></div>
    </template>
    <div class="tiptap-editor">
      <div v-if="!readonly" class="tiptap-editor__toolbar">
        <template v-for="(item, index) in toolbarItems" :key="index">
          <div v-if="item.type === 'divider'" class="tiptap-editor__toolbar-divider"></div>
          <button
            v-else
            class="tiptap-editor__toolbar-btn"
            :class="{ 'is-active': item.isActive ? item.isActive() : false }"
            :title="item.title"
            :disabled="disabled"
            @click="item.action"
          >
            <UIcon :name="item.icon" :size="16" />
          </button>
        </template>
      </div>

      <div class="tiptap-editor__container" @click.self="focusEditor">
        <editor-content class="tiptap-editor__container-content" :editor="editor" />
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { useToolbar } from "./hooks/useToolbar";
import { useLowlight } from "./hooks/useLowlight";
import { useExtensions } from "./hooks/useExtensions";

const modelValue = defineModel<string>({ default: "" });

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "开始输入内容..."
  }
});

const isEditable = computed(() => !props.readonly && !props.disabled);

const lowlight = useLowlight();

const extensions = useExtensions({
  placeholder: props.placeholder,
  lowlight
});

const editor = useEditor({
  content: unref(modelValue),
  extensions,
  editable: unref(isEditable),
  onUpdate: ({ editor }) => {
    if (isEditable.value) {
      modelValue.value = editor.getHTML();
    }
  }
});

watch(
  () => [props.readonly, props.disabled],
  () => {
    if (editor.value) {
      editor.value.setEditable(isEditable.value);
    }
  }
);

watch(modelValue, (newVal) => {
  if (!editor.value) return;
  const isSame = editor.value.getHTML() === newVal;

  if (isSame) return;

  editor.value.commands.setContent(newVal);
});

// 聚焦编辑器
const focusEditor = () => {
  if (!editor.value || !isEditable.value) return;

  editor.value.commands.focus("end");
};

const { toolbarItems } = useToolbar(editor);
</script>

<style lang="scss">
@import url("./styles/tiptap-editor.scss");
// 导入 highlight.js 样式
@import url("highlight.js/styles/atom-one-dark.css");
</style>
