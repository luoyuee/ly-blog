<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { PropType } from "vue";
import { watch } from "vue";

const selected = defineModel<string>();

const props = defineProps({
  options: {
    type: Array as PropType<string[]>,
    default: () => ["custom-color:home", "custom-color:folder", "custom-color:link"]
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
  return props.options.map((item) => ({
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

// eslint-disable-next-line
const handleChange = (e: any) => {
  selected.value = e.icon;
};
</script>
<template>
  <USelectMenu
    v-model="currentValue"
    v-bing="$attrs"
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
