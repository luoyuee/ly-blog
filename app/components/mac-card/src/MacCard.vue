<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ""
  }
});
</script>
<template>
  <div class="mac-card">
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
  background-color: var(--card-bg-color);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;

  .mac-card-header {
    color: var(--text-color-1);
    border-bottom: 1px solid var(--text-color-5);
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
      box-shadow:
        20px 0 #fdbc40,
        40px 0 #35cd4b;
      margin-right: 40px;
    }
  }
  .mac-card-content {
    color: var(--text-color-4);
    padding: 1rem;
  }
}
</style>
