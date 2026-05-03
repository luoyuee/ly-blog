<script setup lang="ts">
import { EditorWorkspace } from "@/components/ly-editor";

definePageMeta({
  layout: "blank",
  colorMode: "dark"
});
</script>
<template>
  <EditorWorkspace />
</template>
<style lang="scss">
@import url("@/components/ly-editor/src/styles/ly-editor.scss");
</style>
