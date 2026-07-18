<script setup lang="ts">
import { ref, computed } from "vue";
import { useSortable } from "@dnd-kit/vue/sortable";

/**
 * 看板卡片：拖拽逻辑照搬 demo/SortableItem.vue，样式恢复项目原暗色风格。
 * - feedback: 'clone' 拖拽生成克隆反馈，源卡保持原位不塌陷
 * - data 透传 group，供 droppable 跨列判定
 * - type/accept='item' 与列隔离
 * 样式不参照 demo：无 handle（整卡可拖）、暗色背景、isDragging class 标记拖拽态。
 */
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  column: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const element = ref<HTMLElement | null>(null);

const { isDragging } = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  group: computed(() => props.column),
  element,
  accept: "item",
  type: "item",
  // feedback: "clone",
  data: computed(() => ({ group: props.column }))
});
</script>

<template>
  <article ref="element" class="kanban-card" :class="{ 'kanban-card--dragging': isDragging }">
    {{ id }}
  </article>
</template>

<style scoped>
.kanban-card {
  background: var(--background-color, #2a2a32);
  border-radius: 8px;
  padding: 10px 12px;
  cursor: grab;
  color: var(--text-color-5, #e5e5e5);
  /* 显式继承父级系统字体，避免卡片自身在拖拽时触发 web 字体回退闪烁 */
  font-family: inherit;
  /* 拖拽时禁止选中文字、禁止触摸滚动，避免与拖拽冲突 */
  user-select: none;
  touch-action: none;
  transition:
    box-shadow 0.2s,
    opacity 0.2s;
  /* 预先提升为 GPU 合成层：拖拽施加 transform 时不触发"临时建层"的重绘跳动 */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.kanban-card:active {
  cursor: grabbing;
}

/* 正在拖拽的源卡片：半透明 + 阴影，原位置留出"坑" */
.kanban-card--dragging {
  opacity: 0.4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
</style>
