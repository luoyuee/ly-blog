<script setup lang="ts">
import type { PropType } from "vue";

export type BaseInfoGridItem = {
  label: string;
  value: string;
  icon: string;
  href?: string;
};

const props = defineProps({
  items: {
    type: Array as PropType<BaseInfoGridItem[]>,
    default: () => []
  }
});
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="基础信息">
    <div
      v-for="item in props.items"
      :key="item.label"
      class="rounded-xl border border-black/10 bg-white/60 p-3"
    >
      <div class="flex items-center gap-1 text-sm text-[var(--text-color-2)]">
        <UIcon class="h-4 w-4" :name="item.icon" />
        {{ item.label }}
      </div>

      <div class="mt-1 break-all text-sm">
        <ULink v-if="item.href" :href="item.href" target="_blank" active>
          {{ item.value }}
        </ULink>
        <span v-else>
          {{ item.value }}
        </span>
      </div>
    </div>
  </div>
</template>
