<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ""
  },
  isChange: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

defineEmits(["reset", "save"]);
</script>

<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>
      <div v-if="isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="submitting" @click="$emit('reset')">
          取消
        </UButton>
        <UButton size="sm" :loading="submitting" @click="$emit('save')"> 保存 </UButton>
      </div>
    </div>

    <slot></slot>
  </div>
</template>
