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
} from "@/components/mdc-editor";

definePageMeta({
  layout: "blank",
  colorMode: "dark"
});
</script>
<template>
  <div class="mdc-editor-root">
    <EditorMenuBar />
    <section class="flex-1 flex overflow-hidden">
      <EditorActivityBar />
      <EditorSidebar />
      <main class="flex-1 flex overflow-hidden">
        <section class="flex-1 flex flex-col overflow-hidden mdc-editor-tab-pane">
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
.mdc-editor-root {
  --mdc-editor-background: #202327;

  --mdc-editor-menu-bar-height: 40px;
  --mdc-editor-status-bar-height: 30px;

  --mdc-editor-foreground: #cccccc;

  --mdc-editor-activity-bar-width: 48px;

  --mdc-editor-sidebar-background: #202327;
  --mdc-editor-toolbar-background: #2e3138;
  --mdc-editor-tabpane-background: #1e1e1e;

  --mdc-editor-luminosity-plus1: hsl(220 60% 95% / 0.06);
  --mdc-editor-luminosity-plus2: hsl(220 60% 95% / 0.1);
  --mdc-editor-luminosity-plus3: hsl(220 60% 95% / 0.14);

  --mdc-editor-active-color: #1574ef;

  background-color: var(--mdc-editor-background);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--mdc-editor-foreground);

  .mdc-editor-tab-pane {
    background-color: var(--mdc-editor-tabpane-background);
  }
}
</style>
