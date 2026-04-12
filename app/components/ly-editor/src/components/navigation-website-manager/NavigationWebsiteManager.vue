<script setup lang="ts">
import ShortcutSection from "./ShortcutSection.vue";
import SearchEngineSection from "./SearchEngineSection.vue";
</script>
<template>
  <div class="flex flex-col h-full divide-y divide-gray-500" @contextmenu.prevent>
    <!-- 快捷方式区域 - 上半部分 -->
    <ShortcutSection />

    <!-- 搜索引擎区域 - 下半部分 -->
    <SearchEngineSection />
  </div>
</template>
