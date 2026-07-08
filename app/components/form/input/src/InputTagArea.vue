<script setup lang="ts">
import { nextTick, reactive } from "vue";

const tags = defineModel<string[]>({ default: () => [] });

const props = defineProps({
  label: {
    type: String,
    default: "添加标签"
  }
});

const state = reactive<{
  showInput: boolean;
  value?: string;
}>({
  showInput: false,
  value: undefined
});

const removeTag = (tag: string) => {
  tags.value = tags.value.filter((item) => item !== tag);
};

const handleChange = () => {
  if (state.value) {
    if (tags.value) {
      if (tags.value.indexOf(state.value) === -1) {
        tags.value = [...tags.value, state.value];
      }
    } else {
      tags.value = [state.value];
    }
  }
  state.showInput = false;
};

const inputRef = useTemplateRef("inputRef");

const showInput = () => {
  state.value = undefined;
  state.showInput = true;

  nextTick(() => {
    inputRef.value?.inputRef?.focus();
  });
};

const blurInput = () => {
  if (!state.value) state.showInput = false;
};
</script>

<template>
  <div
    class="flex min-h-9 w-full flex-wrap items-center gap-2 rounded-md border border-default bg-default px-2 py-2"
    @click.stop
  >
    <span
      v-for="tag in tags"
      :key="tag"
      class="flex shrink-0 items-center gap-1 rounded-md border border-default bg-elevated px-2 py-1 text-xs font-medium text-toned shadow-xs"
    >
      {{ tag }}

      <UButton
        color="neutral"
        variant="ghost"
        icon="lucide:x"
        size="xs"
        class="shrink-0"
        @click="removeTag(tag)"
      />
    </span>

    <UInput
      v-if="state.showInput"
      ref="inputRef"
      v-model.trim="state.value"
      size="xs"
      class="w-24"
      @change="handleChange"
      @blur="blurInput"
    />

    <UButton
      v-else
      icon="lucide:plus"
      size="xs"
      color="neutral"
      variant="outline"
      class="w-24 shrink-0 justify-center"
      @click="showInput"
    >
      {{ props.label }}
    </UButton>
  </div>
</template>
