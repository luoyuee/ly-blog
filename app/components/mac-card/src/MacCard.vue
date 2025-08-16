<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <div class="mac-card dark:bg-red-50">
    <div class="mac-card-header">
      <slot name="header">
        <span>{{ props.title }}</span>
      </slot>
      <span class="dot"></span>
    </div>
    <div class="mac-card-content">
      <slot></slot>
    </div>
  </div>
</template>
<style scoped lang="scss">
.mac-card {
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;

  .mac-card-header {
    color: var(--color-gray-800);
    border-bottom: 1px solid var(--color-gray-200);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    font-size: 1rem;
    font-weight: 500;
    padding: 0.75rem 1rem;
    .dot {
      border-radius: 50%;
      background: #fc625d;
      width: 12px;
      height: 12px;
      box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
      margin-right: 40px;
    }
  }
  .mac-card-content {
    color: var(--color-gray-700);
    padding: 1rem;
  }
}

.mac-card:where(.dark, .dark *) {
  background-color: var(--color-neutral-900);

  .mac-card-header {
    border-bottom: 1px solid var(--color-gray-600);
    color: var(--color-gray-200);
  }

  .mac-card-content {
    color: var(--color-gray-300);
  }
}
</style>
