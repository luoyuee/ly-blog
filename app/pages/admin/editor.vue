<script setup lang="ts">
import {
  EditorActivityBar,
  EditorMenuBar,
  EditorSidebar,
  EditorStatusBar,
  EditorTabBar,
  EditorTabPane,
  EditorPerview,
  EditorModalManager
} from "@/components/ly-editor";

definePageMeta({
  layout: "blank",
  colorMode: "dark"
});
</script>
<template>
  <div class="ly-editor">
    <EditorMenuBar />
    <section class="flex-1 flex overflow-hidden">
      <EditorActivityBar />
      <EditorSidebar />
      <main class="flex-1 flex overflow-hidden">
        <section class="flex-1 flex flex-col overflow-hidden ly-editor__tabs">
          <EditorTabBar />
          <EditorTabPane class="flex-1" />
        </section>
        <EditorPerview class="bg-blue-100" />
      </main>
    </section>
    <EditorStatusBar />
    <EditorModalManager />
  </div>
</template>
<style lang="scss">
@import url("@/components/ly-editor/src/styles/ly-editor.scss");
</style>
