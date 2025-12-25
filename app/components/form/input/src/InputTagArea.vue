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

const removeTag = (tag: string): void => {
  tags.value = tags.value.filter((item) => item !== tag);
};

const handleChange = (): void => {
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

const showInput = (): void => {
  state.value = undefined;
  state.showInput = true;

  nextTick(() => {
    inputRef.value?.inputRef?.focus();
  });
};

const blurInput = (): void => {
  if (!state.value) state.showInput = false;
};
</script>

<template>
  <div class="flex items-center gap-1 flex-wrap" @click.stop>
    <span
      v-for="tag in tags"
      :key="tag"
      class="bg-blue-400 text-white rounded-md pl-2 pr-1 py-1 text-xs flex items-center gap-1 shrink-0"
      @close="removeTag(tag)"
    >
      {{ tag }}
      <span
        class="hover:bg-blue-500 rounded-full flex items-center p-[2px]"
        @click="removeTag(tag)"
      >
        <UIcon name="ep:close" :size="12" class="cursor-pointer" />
      </span>
    </span>
    <UInput
      v-if="state.showInput"
      ref="inputRef"
      v-model.trim="state.value"
      size="xs"
      class="w-[90px]"
      @change="handleChange"
      @blur="blurInput"
    />
    <UButton
      v-else
      icon="ep:plus"
      size="xs"
      class="w-[90px] shrink-0 justify-center"
      @click="showInput"
    >
      {{ props.label }}
    </UButton>
  </div>
</template>
