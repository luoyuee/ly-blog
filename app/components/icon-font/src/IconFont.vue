<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { IconFontType } from "./types";

const props = defineProps({
  icon: {
    type: String as PropType<IconFontType>,
    required: true,
  },
  size: {
    type: [Number, String],
  },
  color: {
    type: String,
  },
  rotate: {
    type: Number,
  },
  spin: {
    type: Boolean,
  },
});

const innerStyle = computed(() => {
  const styles: CSSProperties = {};
  if (props.size) {
    styles.fontSize =
      typeof props.size === "number" ? `${props.size}px` : props.size;
  }
  if (props.rotate) {
    styles.transform = `rotate(${props.rotate}deg)`;
  }
  if (props.color) {
    styles.color = props.color;
  }
  return styles;
});
</script>
<template>
  <svg
    class="iconfont"
    :class="{ 'icon-spin': props.spin }"
    :style="innerStyle"
    aria-hidden="true"
    :data-icon="props.icon"
  >
    <use :xlink:href="'#' + props.icon"></use>
  </svg>
</template>
<style scoped lang="scss">
svg.iconfont {
  display: inline-block;
  width: 1em;
  height: 1em;
  color: inherit;
  font-style: normal;
  vertical-align: -0.15em;
  outline: none;
  stroke: currentColor;
  fill: currentColor;
  font-size: inherit;
}

.icon-spin {
  animation: icon-loading-circle 1s infinite cubic-bezier(0, 0, 1, 1);
}

@keyframes icon-loading-circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
