<script setup lang="ts">
import { computed, toRaw } from "vue";
import { DragDropProvider, PointerSensor, KeyboardSensor } from "@dnd-kit/vue";
import type { DragOverEvent, DragEndEvent } from "@dnd-kit/vue";
import { defaultPreset } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import KanbanColumn from "./KanbanColumn.vue";
import type { KanbanData, KanbanItem } from "./types";

/**
 * 看板组件
 *
 * 核心机制（对齐 dnd-kit 官方推荐姿势）：
 * - DragDropProvider + defaultPreset.plugins + PointerSensor/KeyboardSensor
 * - onDragStart 保存快照，onDragEnd canceled 时回滚
 * - onDragOver 实时 move(items, event)：拖拽中数据随之重排，视觉与数据同步
 * - 列拖拽(type==='column')跳过 move，仅卡片拖拽数据迁移
 *
 * Nuxt SSR 注意：dnd-kit 需真实 DOM 注册 pointer 监听，服务端无 window 会拖不动，
 * 用 ClientOnly 强制客户端渲染。
 *
 * 数据通过 v-model 双向绑定，外部可直接修改数据驱动视图。
 */
const props = defineProps({
  /** 空列提示文案 */
  emptyText: {
    type: String,
    default: "拖到这里"
  },
  /** 卡片透传数据，键为卡片 id，供插槽作用域渲染 */
  items: {
    type: Object as () => Record<string, KanbanItem>,
    default: () => ({})
  }
});

defineSlots<{
  /** 列头插槽，作用域暴露 id/index */
  header(props: { id: string; index: number }): void;
  /** 卡片插槽，作用域暴露 id/column/index/item */
  card(props: { id: string; column: string; index: number; item: KanbanItem }): void;
}>();

/** v-model 双向绑定看板数据 */
const model = defineModel<KanbanData>({ required: true });

/** 列 id 列表，响应式派生自 model */
const columns = computed(() => Object.keys(model.value));

/** 拖拽快照，用于取消时回滚 */
let snapshot = structuredClone(toRaw(model.value));

/** 传感器配置：无 handle，元素本体激活拖拽（整卡/整列可拖） */
const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element];
    }
  }),
  KeyboardSensor
];

/** 拖拽开始：保存当前数据快照 */
function onDragStart() {
  snapshot = structuredClone(toRaw(model.value));
}

/** 拖拽悬停：实时 move 卡片数据，列拖拽跳过 */
function onDragOver(event: DragOverEvent) {
  const { source } = event.operation;
  if (source && source.type === "column") return;
  model.value = move(model.value, event);
}

/** 拖拽结束：取消则回滚到快照 */
function onDragEnd(event: DragEndEvent) {
  if (event.canceled) {
    model.value = snapshot;
  }
}
</script>

<template>
  <ClientOnly>
    <DragDropProvider
      :plugins="defaultPreset.plugins"
      :sensors="sensors"
      @drag-start="onDragStart"
      @drag-over="onDragOver"
      @drag-end="onDragEnd"
    >
      <div class="kanban">
        <KanbanColumn
          v-for="(column, columnIndex) in columns"
          :id="column"
          :key="column"
          :index="columnIndex"
          :rows="model[column] ?? []"
          :empty-text="props.emptyText"
          :items="props.items"
        >
          <template v-if="$slots.header" #header="headerProps">
            <slot name="header" v-bind="headerProps"></slot>
          </template>
          <template v-if="$slots.card" #card="cardProps">
            <slot name="card" v-bind="cardProps"></slot>
          </template>
        </KanbanColumn>
      </div>
    </DragDropProvider>
    <template #fallback>
      <div class="kanban">加载中…</div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.kanban {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  /* 全局锁定灰度抗锯齿：拖拽给卡片加 transform 时，浏览器会把含文字元素
     切到 GPU 合成层并改变抗锯齿模式，导致文字"抖一下像换了字体"。
     固定为 antialiased/grayscale 后渲染路径始终一致，消除该闪烁。
     该属性可被子元素继承，覆盖列头与卡片全部文字。 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 覆盖全局 :root 上的自定义 web 字体。
     拖拽触发合成层重建时会瞬间回退再切回，正是文字抖动的根因。
     改用浏览器系统字体栈后彻底绕过该问题。 */
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC",
    "Microsoft YaHei", sans-serif;
}
</style>
