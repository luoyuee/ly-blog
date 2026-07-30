<script setup lang="ts">
import type { PropType } from "vue";
import type { PlaceholderUi } from "./theme";
import { PlaceholderTheme, mergeTailwindClass } from "./theme";
import { computed } from "vue";

const props = defineProps({
  /** 自定义各部分 Tailwind 类名，会与内部默认类名合并（与 Nuxt UI 主题系统一致） */
  ui: {
    type: Object as PropType<PlaceholderUi>,
    default: () => ({})
  }
});

/** 合并默认主题与外部 ui 覆写 */
const mergedUi = computed(() => ({
  container: mergeTailwindClass(PlaceholderTheme.container, props.ui.container),
  pattern: mergeTailwindClass(PlaceholderTheme.pattern, props.ui.pattern),
  content: mergeTailwindClass(PlaceholderTheme.content, props.ui.content)
}));
</script>

<template>
  <div :class="mergedUi.container">
    <svg :class="mergedUi.pattern" fill="none">
      <defs>
        <pattern
          id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
        </pattern>
      </defs>
      <rect
        stroke="none"
        fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
        width="100%"
        height="100%"
      />
    </svg>

    <div v-if="$slots.default" :class="mergedUi.content">
      <slot></slot>
    </div>
  </div>
</template>
