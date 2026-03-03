<script setup lang="ts">
import type { PropType } from "vue";
import type { IClientConfigSwiperItem } from "@@/shared/types/config";

const props = defineProps({
  items: {
    type: Array as PropType<IClientConfigSwiperItem[]>,
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
    prev-icon="ep:arrow-left-bold"
    next-icon="ep:arrow-right-bold"
    :items="props.items"
    :ui="{
      dot: 'size-2 opacity-40 bg-black',
      prev: 'transition-all duration-300 shadow-[none] cursor-pointer opacity-60 hover:opacity-80',
      next: 'transition-all duration-300 shadow-[none] cursor-pointer opacity-60 hover:opacity-80',
    }"
  >
    <img :src="item.image" class="block w-full h-full object-cover" />
  </UCarousel>
</template>
<style scoped lang="scss">
.swiper {
  overflow: hidden;

  :deep([data-slot="container"]) {
    margin-inline-start: unset;
    max-width: unset;
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

  :deep([data-slot="dots"]) {
    top: 16px;
    right: 16px;
    bottom: unset;
    inset-inline-start: unset;
    inset-inline-end: 16px;

    [data-slot="dot"][data-state="active"] {
      opacity: 0.8;
      background-color: white;
    }
  }
}
</style>
