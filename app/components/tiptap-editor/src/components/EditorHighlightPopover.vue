<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import type { PropType } from "vue";
import { computed } from "vue";

const { t } = useI18n();

const props = defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true
  }
});

const highlightColors = computed(() => [
  {
    label: t("components.tiptapEditor.highlight.default"),
    value: "",
    swatchClass: "bg-transparent"
  },
  {
    label: t("components.tiptapEditor.highlight.yellow"),
    value: "#fef08a",
    swatchClass: "bg-yellow-200"
  },
  {
    label: t("components.tiptapEditor.highlight.green"),
    value: "#bbf7d0",
    swatchClass: "bg-green-200"
  },
  {
    label: t("components.tiptapEditor.highlight.blue"),
    value: "#bfdbfe",
    swatchClass: "bg-blue-200"
  },
  {
    label: t("components.tiptapEditor.highlight.pink"),
    value: "#fbcfe8",
    swatchClass: "bg-pink-200"
  }
]);

const currentHighlightColor = computed(() => {
  const color = props.editor.getAttributes("highlight").color;
  return typeof color === "string" ? color : props.editor.isActive("highlight") ? "active" : "";
});

const active = computed(() => Boolean(currentHighlightColor.value));

const toggleHighlight = (color: string) => {
  const chain = props.editor.chain().focus();

  if (!color) {
    chain.unsetHighlight().run();
    return;
  }

  chain.toggleHighlight({ color }).run();
};
</script>

<template>
  <UPopover :ui="{ content: 'p-2' }">
    <UTooltip :text="$t('components.tiptapEditor.highlight.tooltip')">
      <UButton
        icon="lucide:highlighter"
        color="neutral"
        active-color="primary"
        variant="ghost"
        active-variant="soft"
        size="sm"
        :active="active"
      />
    </UTooltip>

    <template #content>
      <div class="flex items-center gap-2">
        <button
          v-for="item in highlightColors"
          :key="item.label"
          type="button"
          :aria-label="item.label"
          :title="item.label"
          :class="[
            'size-4 rounded-full p-0 flex-none transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            item.swatchClass,
            currentHighlightColor === item.value
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-white shadow-sm'
              : 'ring-1 ring-gray-200'
          ]"
          :style="item.value ? { backgroundColor: item.value } : undefined"
          @click="toggleHighlight(item.value)"
        >
          <span class="sr-only">{{ item.label }}</span>
        </button>
      </div>
    </template>
  </UPopover>
</template>
