<script setup lang="ts">
import type { PropType } from "vue";
import { createExtensions } from "./config/createExtensions";

const modelValue = defineModel<string>({ default: "" });

const props = defineProps({
  contentType: {
    type: String as PropType<"html" | "markdown">,
    default: "html"
  }
});

const extensions = createExtensions();
</script>

<template>
  <UEditor
    v-model="modelValue"
    class="w-full min-h-[60px]"
    :content-type="props.contentType"
    :starter-kit="{ code: {}, codeBlock: false }"
    :extensions="extensions"
    :editable="false"
  />
</template>

<style lang="scss">
@import url("highlight.js/styles/atom-one-dark.css");
</style>
