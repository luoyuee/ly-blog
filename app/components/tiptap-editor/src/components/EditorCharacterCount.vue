<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import type { PropType } from "vue";

defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true
  }
});

const characterCountText = (editor: Editor) => {
  return `${editor.storage.characterCount.characters()} 字符 / ${editor.storage.characterCount.words()} 词`;
};
</script>

<template>
  <div class="pointer-events-none absolute bottom-2 right-3 z-10">
    <div
      class="rounded-full border border-gray-100 bg-white/90 px-2.5 py-1 text-xs text-gray-500 shadow-sm backdrop-blur"
    >
      {{ characterCountText(editor) }}
    </div>
  </div>
</template>
