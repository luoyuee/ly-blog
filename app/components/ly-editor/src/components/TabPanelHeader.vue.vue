<script lang="ts" setup></script>
<template>
  <div class="flex justify-between items-center">
    <div class="flex gap-4">
      <slot name="left"></slot>
    </div>

    <div class="flex gap-4">
      <slot name="right"></slot>
    </div>
  </div>
</template>
