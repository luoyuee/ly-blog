<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { isNil } from "@/utils/typed";

const modelValue = defineModel<string | number | boolean | undefined | null>({});

const attrs = useAttrs();

const props = defineProps({
  searchable: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  disabled: {
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
</script>

<template>
  <USelectMenu
    v-model="modelValue"
    class="w-full"
    :value-key="valueKey"
    :label-key="labelKey"
    :disabled="disabled"
    :clear="clear"
    v-bind="attrs"
    :ui="{
      input: `${props.searchable ? '' : 'hidden'}`
    }"
  />
</template>
