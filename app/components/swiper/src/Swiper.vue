<script setup lang="ts">
import type { PropType } from "vue";

interface SwiperItem {
  src: string;
  title?: string;
  [key: string]: unknown;
}

const props = defineProps({
  items: {
    type: Array as PropType<SwiperItem[]>,
    default: () => []
  }
});
</script>
<template>
  <UCarousel
    v-slot="{ item }"
    dots
    loop
    arrows
    orientation="horizontal"
    class="rounded-lg swiper"
    :items="props.items"
    :ui="{
      dot: 'size-2 opacity-20',
      prev: 'transition-all duration-300 shadow-[none] bg-black/40 hover:bg-black/50 cursor-pointer',
      next: 'transition-all duration-300 shadow-[none] bg-black/40 hover:bg-black/50 cursor-pointer'
    }"
  >
    <img :src="item.src" class="w-full h-full object-cover" />
  </UCarousel>
</template>
<style scoped lang="scss">
.swiper {
  overflow: hidden;

  :deep(.container) {
    margin-inline-start: unset;
    .item {
      padding-inline-start: unset;
    }
  }

  &:hover {
    :deep(.prev) {
      inset-inline-start: 10px;
    }

    :deep(.next) {
      inset-inline-end: 10px;
    }
  }

  :deep(.dots) {
    top: 16px;
    right: 16px;
    bottom: unset;
    inset-inline-start: unset;
    inset-inline-end: 16px;
    .dot.active {
      opacity: 1;
    }
  }
}
</style>
