<script setup lang="ts">
import type { CSSProperties, PropType } from "vue";
import { computed } from "vue";

type EmptySize = string | number;

const props = defineProps({
  icon: {
    type: String,
    default: "lucide:inbox"
  },
  iconSize: {
    type: [String, Number] as PropType<EmptySize>,
    default: 48
  },
  image: {
    type: String,
    default: ""
  },
  imageSize: {
    type: [String, Number] as PropType<EmptySize>,
    default: 80
  },
  imageAlt: {
    type: String,
    default: "空状态"
  },
  title: {
    type: String,
    default: "暂无数据"
  }
});

const formatSize = (size: EmptySize) => {
  return typeof size === "number" ? `${size}px` : size;
};

const iconStyle = computed<CSSProperties>(() => ({
  width: formatSize(props.iconSize),
  height: formatSize(props.iconSize)
}));

const imageStyle = computed<CSSProperties>(() => ({
  width: formatSize(props.imageSize),
  height: formatSize(props.imageSize)
}));
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 text-center text-gray-400">
    <slot name="icon" :icon-size="props.iconSize" :image-size="props.imageSize">
      <img
        v-if="props.image"
        :src="props.image"
        :alt="props.imageAlt"
        :style="imageStyle"
        class="object-contain"
      />
      <UIcon v-else :name="props.icon" :style="iconStyle" />
    </slot>

    <div class="flex flex-col items-center gap-2">
      <slot name="title">
        <p class="text-sm leading-5 text-gray-500">{{ props.title }}</p>
      </slot>

      <slot></slot>
    </div>
  </div>
</template>
