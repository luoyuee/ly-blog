<script setup lang="ts">
import { ref, toRaw } from "vue";
import { DragDropProvider, PointerSensor, KeyboardSensor } from "@dnd-kit/vue";
import type { DragOverEvent, DragEndEvent } from "@dnd-kit/vue";
import { defaultPreset } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import KanbanColumn from "./kanban-column.vue";

/**
 * 看板主页：拖拽逻辑照搬 demo/App.vue，样式恢复项目原暗色风格。
 *
 * 核心机制（对齐 dnd-kit 官方推荐姿势）：
 * - DragDropProvider + defaultPreset.plugins + PointerSensor/KeyboardSensor
 * - onDragStart 保存快照，onDragEnd canceled 时回滚
 * - onDragOver 实时 move(items, event)：拖拽中数据随之重排，视觉与数据同步，
 *   无需 nonce 强制重建、无需 DragOverlay 浮层。列拖拽(type==='column')跳过 move。
 * - 卡片用 feedback:'clone' 自带克隆反馈，源卡保持原位占位。
 * 样式不参照 demo：无 handle（activatorElements 只返回 element）、暗色背景、BEM 类名。
 *
 * Nuxt SSR 注意：dnd-kit 需真实 DOM 注册 pointer 监听，服务端无 window 会拖不动，
 * 用 ClientOnly 强制客户端渲染。
 */
function createRange(length: number) {
  return Array.from({ length }, (_, i) => i + 1);
}

const ITEM_COUNT = 6;

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      // 无 handle：仅元素本体可激活拖拽（整卡/整列可拖）
      return [source.element];
    }
  }),
  KeyboardSensor
];

const items = ref<Record<string, string[]>>({
  A: createRange(ITEM_COUNT).map((id) => `A${id}`),
  B: createRange(ITEM_COUNT).map((id) => `B${id}`),
  C: createRange(ITEM_COUNT).map((id) => `C${id}`),
  D: []
});

const columns = Object.keys(items.value);
let snapshot = structuredClone(toRaw(items.value));

function onDragStart() {
  snapshot = structuredClone(toRaw(items.value));
}

function onDragOver(event: DragOverEvent) {
  const { source } = event.operation;
  // 列拖拽不实时移动数据（与 demo 一致），仅卡片拖拽走 move
  if (source && source.type === "column") return;
  items.value = move(items.value, event);
}

function onDragEnd(event: DragEndEvent) {
  if (event.canceled) {
    items.value = snapshot;
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
      <div class="kanban-dndkit">
        <KanbanColumn
          v-for="(column, columnIndex) in columns"
          :id="column"
          :key="column"
          :index="columnIndex"
          :rows="items[column]!"
        />
      </div>
    </DragDropProvider>
    <template #fallback>
      <div class="kanban-dndkit">加载中…</div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.kanban-dndkit {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  /* 全局锁定灰度抗锯齿：拖拽给卡片加 transform 时，浏览器会把含文字元素
     切到 GPU 合成层并改变抗锯齿模式，导致文字"抖一下像换了字体"。
     固定为 antialiased/grayscale 后渲染路径始终一致，消除该闪烁。
     该属性可被子元素继承，覆盖列头与卡片全部文字。 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 覆盖全局 :root 上的 "DingTalk JinBuTi" 自定义 web 字体。
     该字体使用 font-display:swap 且按 unicode-range 切成数十个 woff2 子集，
     拖拽触发合成层重建时会瞬间回退再切回，正是文字抖动的根因。
     改用浏览器系统字体栈后彻底绕过该问题（仅作用于本示例页）。 */
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC",
    "Microsoft YaHei", sans-serif;
}
</style>
