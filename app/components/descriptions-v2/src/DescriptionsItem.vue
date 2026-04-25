<script setup lang="ts">
export interface Props {
  label?: string; // 内容的描述标签 string | slot
  span?: number; // 包含列的数量；当使用水平列表且未设置 span 时等效于 span: 1，但最后一行的最后一项，会包含该行剩余的所有列数
}
withDefaults(defineProps<Props>(), {
  label: undefined,
  span: undefined
});
</script>
<template>
  <tr :data-span="span">
    <th
      class="border-r border-gray-200 bg-gray-50 text-start font-normal text-gray-900 last:border-r-0"
    >
      <slot name="label">{{ label }}</slot>
    </th>
    <td
      class="table-cell flex-1 break-words border-r border-gray-200 text-gray-900 last:border-r-0"
    >
      <slot></slot>
    </td>
  </tr>
</template>
