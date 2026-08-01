<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

/**
 * 思维导图包裹层组件。
 * 使用 defineAsyncComponent + ClientOnly 双重保障：
 * - ClientOnly：阻止 SSR 渲染
 * - defineAsyncComponent：阻止 SSR 阶段静态 import @antv/x6，仅在客户端按需加载
 * 调用方直接使用本组件无需手动包裹 ClientOnly。
 * 支持 v-model 双向绑定与导入/导出方法（通过 ref 调用）。
 */
defineOptions({ inheritAttrs: false });

/** 思维导图节点数据（树形结构） */
export type MindmapData = {
  id: string;
  type: "topic" | "topic-branch" | "topic-child";
  label: string;
  width: number;
  height: number;
  children?: MindmapData[];
};

const model = defineModel<MindmapData>({
  default: () => ({
    id: "1",
    type: "topic",
    label: "中心主题",
    width: 160,
    height: 50,
    children: []
  })
});

const canvasRef = ref<{
  importData: (data: MindmapData) => void;
  exportData: () => MindmapData;
} | null>(null);

const MindmapCanvas = defineAsyncComponent(() => import("./MindmapCanvas.vue"));

/** 导入数据到思维导图 */
const importData = (data: MindmapData): void => {
  canvasRef.value?.importData(data);
};
/** 导出当前思维导图数据 */
const exportData = (): MindmapData => {
  return canvasRef.value?.exportData() ?? model.value;
};

defineExpose({ importData, exportData });
</script>

<template>
  <ClientOnly>
    <MindmapCanvas ref="canvasRef" v-model="model" v-bind="$attrs" />
  </ClientOnly>
</template>
