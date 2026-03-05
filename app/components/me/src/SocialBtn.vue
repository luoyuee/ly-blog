<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String
  },
  href: {
    type: String
  },
  target: {
    type: String,
    default: "_blank"
  },
  hoverBg: {
    type: String
  }
});

const socialBtnRef = useTemplateRef("socialBtnRef");

const socialBtnStyle = computed(() => {
  return props.hoverBg ? { "--social-btn-hover-bg": props.hoverBg } : undefined;
});
</script>
<template>
  <a
    ref="socialBtnRef"
    class="social-btn"
    :style="socialBtnStyle"
    :href="props.href"
    :target="props.target"
  >
    <UIcon v-if="props.icon" :name="props.icon" :size="16" />
    <slot></slot>
  </a>
</template>

<style scoped>
@reference "tailwindcss";

.social-btn {
  @apply cursor-pointer inline-flex gap-1 p-1 text-xs rounded-md transition-colors hover:text-white bg-gray-500/20;
}

.social-btn:hover {
  background: var(--social-btn-hover-bg, var(--color-gray-700));
}
</style>
