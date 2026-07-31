<script setup lang="ts">
import { ref, computed } from "vue";
import type { PropType } from "vue";
import { useSortable } from "@dnd-kit/vue/sortable";
import type { KanbanItem } from "./types";

/**
 * 看板卡片
 * - feedback: 'clone' 拖拽生成克隆反馈，源卡保持原位不塌陷
 * - type/accept='item' 与列拖拽隔离
 * - 透传默认插槽，供外部自定义卡片内容渲染
 */
const props = defineProps({
  /** 卡片唯一 id（跨列全局唯一） */
  id: {
    type: String,
    required: true
  },
  /** 所属列 id */
  column: {
    type: String,
    required: true
  },
  /** 卡片在当前列中的索引 */
  index: {
    type: Number,
    required: true
  },
  /** 卡片透传数据，用于插槽作用域渲染 */
  item: {
    type: [Object, String, Number] as PropType<KanbanItem>,
    default: null
  }
});

defineSlots<{
  /** 卡片内容插槽，作用域暴露 id/column/index/item */
  default(props: { id: string; column: string; index: number; item: KanbanItem }): void;
}>();

const element = ref<HTMLElement | null>(null);

const { isDragging } = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  group: computed(() => props.column),
  element,
  accept: "item",
  type: "item",
  data: computed(() => ({ group: props.column }))
});
</script>

<template>
  <article ref="element" class="kanban-card" :class="{ 'kanban-card--dragging': isDragging }">
    <slot :id="id" :column="column" :index="index" :item="item">
      {{ id }}
    </slot>
  </article>
</template>

<style scoped>
.kanban-card {
  background: var(--background-color, #2a2a32);
  border-radius: 8px;
  padding: 10px 12px;
  cursor: grab;
  color: var(--text-color-5, #e5e5e5);
  /* 显式继承父级系统字体，避免拖拽时触发 web 字体回退闪烁 */
  font-family: inherit;
  /* 禁止选中文字、禁止触摸滚动，避免与拖拽冲突 */
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
