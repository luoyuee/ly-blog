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

const textColors = computed(() => [
  {
    label: t("components.tiptapEditor.textColor.default"),
    value: "",
    swatchClass: "bg-transparent"
  },
  {
    label: t("components.tiptapEditor.textColor.blue"),
    value: "#3b82f6",
    swatchClass: "bg-blue-500"
  },
  {
    label: t("components.tiptapEditor.textColor.green"),
    value: "#22c55e",
    swatchClass: "bg-green-500"
  },
  {
    label: t("components.tiptapEditor.textColor.orange"),
    value: "#f59e0b",
    swatchClass: "bg-amber-500"
  },
  { label: t("components.tiptapEditor.textColor.red"), value: "#ef4444", swatchClass: "bg-red-500" }
]);

const currentTextColor = computed(() => {
  const color = props.editor.getAttributes("textStyle").color;
  return typeof color === "string" ? color : "";
});

const active = computed(() => Boolean(currentTextColor.value));

const setTextColor = (color: string) => {
  const chain = props.editor.chain().focus();

  if (color) {
    chain.setColor(color).run();
    return;
  }

  chain.unsetColor().run();
};
</script>

<template>
  <UPopover :ui="{ content: 'p-2' }">
    <UTooltip :text="$t('components.tiptapEditor.textColor.tooltip')">
      <UButton
        icon="lucide:palette"
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
          v-for="item in textColors"
          :key="item.label"
          type="button"
          :aria-label="item.label"
          :title="item.label"
          :class="[
            'size-4 rounded-full p-0 flex-none transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            item.swatchClass,
            currentTextColor === item.value
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-white shadow-sm'
              : 'ring-1 ring-gray-200'
          ]"
          :style="item.value ? { backgroundColor: item.value } : undefined"
          @click="setTextColor(item.value)"
        >
          <span class="sr-only">{{ item.label }}</span>
        </button>
      </div>
    </template>
  </UPopover>
</template>
