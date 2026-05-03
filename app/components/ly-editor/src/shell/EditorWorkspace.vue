<script setup lang="ts">
import EditorActivityBar from "./EditorActivityBar.vue";
import EditorMenuBar from "./EditorMenuBar.vue";
import EditorModalManager from "../modals/EditorModalManager.vue";
import EditorPreview from "./EditorPreview.vue";
import EditorSidebar from "./EditorSidebar.vue";
import EditorStatusBar from "./EditorStatusBar.vue";
import EditorTabBar from "./EditorTabBar.vue";
import EditorTabPane from "./EditorTabPane.vue";
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
        <EditorPreview class="bg-blue-100" />
      </main>
    </section>
    <EditorStatusBar />
    <EditorModalManager />
  </div>
</template>
