<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: ""
  },
  content: {
    type: [String, Number, Boolean, Object, Array],
    default: ""
  }
});
</script>
<template>
  <tr>
    <td class="border-1 border-white/20 bg-white/5 py-1 px-2 text-nowrap w-0">
      {{ props.label }}
    </td>
    <td class="border-1 border-white/20 py-1 px-2 text-sm break-all">
      <slot>
        {{ props.content }}
      </slot>
    </td>
  </tr>
</template>
