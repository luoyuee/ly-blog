<script setup lang="ts">
import { ref, computed } from "vue";
import type { PropType } from "vue";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/vue/sortable";
import KanbanCard from "./KanbanCard.vue";
import type { KanbanItem } from "./types";

/**
 * 看板列
 * - accept: ['column', 'item'] 同时接收列与卡片拖拽
 * - collisionPriority: Low 避免与卡片 droppable 抢占碰撞目标
 * - 列头为视觉把手（整列可拖，cursor: grab）
 * - 透传列头插槽与卡片插槽，供外部自定义渲染
 */
const props = defineProps({
  /** 列唯一 id */
  id: {
    type: String,
    required: true
  },
  /** 列在当前看板中的索引 */
  index: {
    type: Number,
    required: true
  },
  /** 当前列下的卡片 id 列表 */
  rows: {
    type: Array as PropType<string[]>,
    required: true
  },
  /** 空列提示文案 */
  emptyText: {
    type: String,
    default: "拖到这里"
  },
  /** 卡片透传数据，用于插槽作用域渲染 */
  items: {
    type: Object as PropType<Record<string, KanbanItem>>,
    default: () => ({})
  }
});

defineSlots<{
  /** 列头插槽，作用域暴露 id/index */
  header(props: { id: string; index: number }): void;
  /** 卡片插槽，作用域暴露 id/column/index/item */
  card(props: { id: string; column: string; index: number; item: KanbanItem }): void;
}>();

const element = ref<HTMLElement | null>(null);

const { isDragging } = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  element,
  accept: ["column", "item"],
  collisionPriority: CollisionPriority.Low,
  type: "column"
});
</script>

<template>
  <section ref="element" class="kanban-column" :class="{ 'kanban-column--dragging': isDragging }">
    <header class="kanban-column__header">
      <slot :id="id" name="header" :index="index">
        <UIcon name="lucide:grip-vertical" class="kanban-column__grip" aria-hidden="true" />
        {{ id }}
      </slot>
    </header>
    <div class="kanban-column__list">
      <KanbanCard
        v-for="(itemId, itemIndex) in rows"
        :id="itemId"
        :key="itemId"
        :column="id"
        :index="itemIndex"
        :item="items[itemId]"
      >
        <template #default="cardProps">
          <slot name="card" v-bind="cardProps"></slot>
        </template>
      </KanbanCard>
      <p v-if="rows.length === 0" class="kanban-column__empty">{{ emptyText }}</p>
    </div>
  </section>
</template>

<style scoped>
.kanban-column {
  width: 260px;
  flex-shrink: 0;
  background: var(--background-color, #1e1e24);
  border-radius: 10px;
  padding: 12px;
  /* 继承父级系统字体，避免自定义 web 字体在拖拽合成层重建时回退闪烁 */
  font-family: inherit;
  transition:
    box-shadow 0.2s,
    opacity 0.2s;
}

.kanban-column--dragging {
  opacity: 0.4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.kanban-column__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-color-5, #e5e5e5);
  /* 列头作为列拖拽的视觉把手 */
  cursor: grab;
}

.kanban-column__header:active {
  cursor: grabbing;
}

.kanban-column__grip {
  opacity: 0.5;
  letter-spacing: -2px;
}

.kanban-column__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
}

.kanban-column__empty {
  color: var(--text-color-5, #e5e5e5);
  opacity: 0.4;
  text-align: center;
  font-size: 0.85rem;
  padding: 16px 0;
  /* 空列提示不可被当作拖拽起点 */
  user-select: none;
  pointer-events: none;
}
</style>
