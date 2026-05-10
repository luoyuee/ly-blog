<script setup lang="ts">
import { computed, provide, ref, watch, type PropType, type Ref } from "vue";

export interface CollapsiblePanelContext {
  isMultiple: boolean;
  openKeys: Ref<string[]>;
  toggle: (key: string) => void;
  register: (key: string) => void;
  unregister: (key: string) => void;
}

type ModelValue = string | string[] | null;

const normalizeModelValue = (value: ModelValue, isMultiple: boolean): string[] => {
  if (Array.isArray(value)) {
    return isMultiple ? [...value] : value.slice(0, 1);
  }

  if (typeof value === "string" && value) {
    return [value];
  }

  return [];
};

const toEmitValue = (keys: string[], isMultiple: boolean): string | string[] | null => {
  if (isMultiple) {
    return [...keys];
  }

  return keys[0] ?? null;
};

const props = defineProps({
  modelValue: {
    type: [String, Array] as PropType<ModelValue>,
    default: null
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  "update:modelValue": [value: string | string[] | null];
}>();

const openKeys = ref<string[]>(normalizeModelValue(props.modelValue, props.multiple));
const orderedKeys = ref<string[]>([]);

watch(
  () => [props.modelValue, props.multiple] as const,
  (val) => {
    openKeys.value = normalizeModelValue(val[0], val[1]);
  }
);

watch(openKeys, (val) => {
  emit("update:modelValue", toEmitValue(val, props.multiple));
});

const toggle = (key: string) => {
  const isOpen = openKeys.value.includes(key);

  if (props.multiple) {
    openKeys.value = isOpen
      ? openKeys.value.filter((item) => item !== key)
      : [...openKeys.value, key];
    return;
  }

  openKeys.value = isOpen ? [] : [key];
};

const register = (key: string) => {
  if (!orderedKeys.value.includes(key)) {
    orderedKeys.value.push(key);
  }
};

const unregister = (key: string) => {
  const idx = orderedKeys.value.indexOf(key);
  if (idx !== -1) {
    orderedKeys.value.splice(idx, 1);
  }

  if (openKeys.value.includes(key)) {
    openKeys.value = openKeys.value.filter((item) => item !== key);
  }
};

const gridTemplateRows = computed(() => {
  const rows: string[] = [];
  for (const key of orderedKeys.value) {
    rows.push("min-content", openKeys.value.includes(key) ? "1fr" : "0fr");
  }
  return rows.join(" ");
});

provide<CollapsiblePanelContext>("collapsiblePanel", {
  isMultiple: props.multiple,
  openKeys,
  toggle,
  register,
  unregister
});
</script>

<template>
  <div class="collapsible-panel" :style="{ gridTemplateRows }">
    <slot></slot>
  </div>
</template>

<style scoped>
.collapsible-panel {
  display: grid;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  transition: grid-template-rows 0.25s ease;
}
</style>
