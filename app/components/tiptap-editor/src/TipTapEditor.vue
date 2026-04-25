<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import type { PropType } from "vue";
import { bubbleToolbarItems, fixedToolbarItems } from "./config/toolbarItems";
import { computed } from "vue";
import EditorLinkPopover from "./components/EditorLinkPopover.vue";
import EditorTextColorPopover from "./components/EditorTextColorPopover.vue";
import EditorHighlightPopover from "./components/EditorHighlightPopover.vue";
import EditorCharacterCount from "./components/EditorCharacterCount.vue";
import { createExtensions } from "./config/createExtensions";

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
  },
  contentType: {
    type: String as PropType<"html" | "markdown">,
    default: "html"
  }
});

const isEditable = computed(() => !props.readonly && !props.disabled);

const extensions = createExtensions();
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="modelValue"
    :content-type="props.contentType"
    :starter-kit="{ code: {}, codeBlock: false }"
    :extensions="extensions"
    :placeholder="{ placeholder: props.placeholder, mode: 'firstLine' }"
    :editable="isEditable"
    :ui="{
      root: [
        'w-full min-h-[200px] relative isolate flex flex-col rounded-md overflow-hidden',
        'before:pointer-events-none before:absolute before:inset-0 before:z-10',
        'before:rounded-[inherit] before:content-[\'\']',
        'before:ring-1 before:ring-inset before:ring-accented',
        'focus-within:before:ring-2 focus-within:before:ring-primary'
      ].join(' '),
      base: 'px-4 sm:px-6 py-3',
      content: 'overflow-y-auto'
    }"
  >
    <UEditorToolbar
      v-if="isEditable"
      :editor="editor"
      :items="fixedToolbarItems"
      :ui="{
        base: 'shrink-0 px-2 py-1.5 overflow-x-auto rounded-t-md bg-gray-50'
      }"
    >
      <template #textColor>
        <EditorTextColorPopover :editor="editor as unknown as Editor" />
      </template>

      <template #link>
        <EditorLinkPopover :editor="editor as unknown as Editor" auto-open />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      v-if="isEditable"
      :editor="editor"
      :items="bubbleToolbarItems"
      layout="bubble"
      :should-show="
        ({ view, state }) => view.hasFocus() && !state.selection.empty
      "
    >
      <template #highlight>
        <EditorHighlightPopover :editor="editor as unknown as Editor" />
      </template>

      <template #link>
        <EditorLinkPopover :editor="editor as unknown as Editor" />
      </template>
    </UEditorToolbar>

    <EditorCharacterCount
      v-if="isEditable"
      :editor="editor as unknown as Editor"
    />
  </UEditor>
</template>

<style lang="scss">
@import url("highlight.js/styles/atom-one-dark.css");
</style>
