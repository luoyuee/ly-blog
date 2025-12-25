<script setup lang="ts">
import { useConfigStore } from "@/stores";
import MacCard from "./MacCard.vue";

const configStore = useConfigStore();
</script>
<template>
  <MacCard :title="$t('components.noticeCard.title')">
    <div class="whitespace-pre text-sm">
      {{ configStore.basic.notice }}
    </div>
  </MacCard>
</template>
