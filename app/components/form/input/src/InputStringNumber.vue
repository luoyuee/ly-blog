<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({
  inheritAttrs: false
});

type InputNumberModelValue = string | undefined | null;
type InputNumberInnerValue = number | undefined;

const modelValue = defineModel<InputNumberModelValue>({ default: undefined });

defineProps({});

const attrs = useAttrs();

const innerValue = computed<InputNumberInnerValue>({
  get() {
    if (modelValue.value === "" || modelValue.value === undefined || modelValue.value === null) {
      return undefined;
    }

    const value = Number(modelValue.value);

    return Number.isNaN(value) ? undefined : value;
  },
  set(value) {
    if (value === undefined) {
      modelValue.value = value;
      return;
    }

    modelValue.value = String(value);
  }
});
</script>

<template>
  <UInputNumber v-model="innerValue" v-bind="attrs" />
</template>
