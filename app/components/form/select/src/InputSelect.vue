<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { isNil } from "@/utils/typed";

const modelValue = defineModel<string | number | undefined | null>({});
const open = defineModel<boolean>("open", { default: false });

const attrs = useAttrs();

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  valueKey: {
    type: String,
    default: "value"
  },
  labelKey: {
    type: String,
    default: "label"
  }
});

const clear = computed(() => {
  if (props.disabled) return false;
  if (isNil(modelValue.value)) return false;
  return props.clearable;
});

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    open.value = false;
  }
};
</script>

<template>
  <UInputMenu
    v-model="modelValue"
    v-model:open="open"
    class="w-full"
    autocomplete
    open-on-focus
    ignore-filter
    :value-key="valueKey"
    :label-key="labelKey"
    :disabled="disabled"
    :clear="clear"
    v-bind="attrs"
    @keydown="handleKeydown"
  />
</template>
