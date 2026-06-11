<script lang="ts" setup>
/** 获取插槽实例 */
const slots = useSlots();

/** 是否存在默认插槽 */
const hasDefaultSlot = computed(() => !!slots.default);
</script>
<template>
  <div :class="['flex items-center gap-4', { 'justify-between': !hasDefaultSlot }]">
    <slot>
      <div class="flex items-center gap-4">
        <slot name="left"></slot>
      </div>

      <div class="flex items-center gap-4">
        <slot name="right"></slot>
      </div>
    </slot>
  </div>
</template>
