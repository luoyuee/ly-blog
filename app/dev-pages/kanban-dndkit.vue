<script setup lang="ts">
import { ref } from "vue";
import { Kanban } from "@/components/kanban";
import type { KanbanData } from "@/components/kanban";

/**
 * 看板组件测试页
 * 用于验证 Kanban 组件的 v-model 双向绑定与 dnd-kit 拖拽交互
 */
function createRange(length: number) {
  return Array.from({ length }, (_, i) => i + 1);
}

const ITEM_COUNT = 6;

const items = ref<KanbanData>({
  A: createRange(ITEM_COUNT).map((id) => `A${id}`),
  B: createRange(ITEM_COUNT).map((id) => `B${id}`),
  C: createRange(ITEM_COUNT).map((id) => `C${id}`),
  D: []
});
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Kanban DnD Kit 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证基于 dnd-kit 的看板拖拽交互，支持卡片跨列移动、列整体拖拽、空列投放与取消回滚。
      </p>
    </section>

    <Kanban v-model="items" />
  </main>
</template>
