<script setup lang="ts">
import type { PropType } from "vue";

export type LinkItem = {
  title: string;
  desc: string;
  href: string;
  icon: string;
};

const props = defineProps({
  items: {
    type: Array as PropType<LinkItem[]>,
    default: () => []
  }
});
</script>

<template>
  <div class="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2">
    <ULink
      v-for="item in props.items"
      :key="item.href"
      class="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/90 p-4 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-[2px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
      :href="item.href"
      active
    >
      <div class="flex-1">
        <div class="text-base font-bold text-[var(--text-color-1)]">
          {{ item.title }}
        </div>
        <div class="mt-1 truncate text-sm text-[var(--text-color-3)]">
          {{ item.desc }}
        </div>
      </div>

      <div class="flex items-center justify-center" aria-hidden="true">
        <img
          class="h-10 w-10 object-contain"
          :src="item.icon"
          :alt="item.title"
          loading="lazy"
          decoding="async"
        />
      </div>
    </ULink>
  </div>
</template>
