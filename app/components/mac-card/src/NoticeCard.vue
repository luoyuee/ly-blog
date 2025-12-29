<script setup lang="ts">
import { useNoticeStore } from "@/stores";
import MacCard from "./MacCard.vue";

const noticeStore = useNoticeStore();
</script>
<template>
  <MacCard :title="$t('components.noticeCard.title')">
    <div class="whitespace-pre text-sm">
      {{ noticeStore.card.content }}
    </div>
  </MacCard>
</template>
