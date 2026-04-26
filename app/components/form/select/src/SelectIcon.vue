<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { PropType } from "vue";
import { SelectIconDefaultOptions } from "#shared/constants/icons";
import { watch } from "vue";

const selected = defineModel<string>();

const props = defineProps({
  items: {
    type: Array as PropType<string[]>,
    default: () => SelectIconDefaultOptions
  },
  placeholder: {
    type: String
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const items = computed<SelectMenuItem[]>(() => {
  return props.items.map((item) => ({
    label: item,
    icon: item
  }));
});

const currentValue = ref<{ label: string; icon: string } | null>(null);

watch(selected, (newVal) => {
  if (newVal) {
    currentValue.value = {
      label: newVal,
      icon: newVal
    };
  } else {
    currentValue.value = null;
  }
});

onMounted(() => {
  if (selected.value) {
    currentValue.value = {
      label: selected.value,
      icon: selected.value
    };
  }
});

const handleChange = (value: SelectMenuItem) => {
  if (!value) return;

  if (typeof value !== "object") return;

  selected.value = value.icon;
};
</script>
<template>
  <USelectMenu
    v-model="currentValue"
    v-bind="$attrs"
    class="w-full"
    :search-input="{
      placeholder: '搜索...',
      icon: 'i-lucide-search'
    }"
    :items="items"
    :leading-icon="currentValue ? currentValue.icon : undefined"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    @update:model-value="handleChange"
  />
</template>
