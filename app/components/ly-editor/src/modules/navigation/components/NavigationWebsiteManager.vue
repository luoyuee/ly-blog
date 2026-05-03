<script setup lang="ts">
import ShortcutSection from "./ShortcutSection.vue";
import SearchEngineSection from "./SearchEngineSection.vue";
</script>
<template>
  <div class="flex flex-col h-full divide-y divide-gray-500" @contextmenu.prevent>
    <ShortcutSection />
    <SearchEngineSection />
  </div>
</template>
