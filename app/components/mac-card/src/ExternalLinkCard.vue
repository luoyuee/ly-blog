<script setup lang="ts">
import { useConfigStore } from "@/stores";
import MacCard from "./MacCard.vue";

const configStore = useConfigStore();
</script>
<template>
  <MacCard title="相关链接">
    <div class="text-sm space-x-2 space-y-2">
      <a
        v-for="(item, index) in configStore.external_link_card"
        :key="index"
        class="inline-flex items-center gap-1 bg-slate-100 text-gray-600 hover:bg-slate-200 hover:text-primary cursor-pointer transition-all duration-150 px-2 py-1 rounded"
        target="_blank"
        :href="item.href"
      >
        <UIcon name="custom-color:firefox" />
        <span>{{ item.title }}</span>
      </a>
    </div>
  </MacCard>
</template>
