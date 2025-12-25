<template>
  <div class="p-4">
    <UTabs :items="items">
      <template #[item.slot] v-for="item in items" :key="item.slot">
        <div class="w-86 h-96">
          <img :src="item.image" class="w-full h-full object-cover" />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import { useConfigStore } from "@/stores";

const configStore = useConfigStore();

const items = computed(() => {
  if (!configStore.article.payment_qr_code) {
    return [];
  }

  return configStore.article.payment_qr_code.map((item, index) => {
    return {
      ...item,
      label: item.name,
      slot: `slot-${index}`
    };
  });
});
</script>
