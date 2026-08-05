<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

/**
 * 流程图包裹层组件。
 * 使用 defineAsyncComponent + ClientOnly 双重保障：
 * - ClientOnly：阻止 SSR 渲染
 * - defineAsyncComponent：阻止 SSR 阶段静态 import @antv/x6，仅在客户端按需加载
 * 调用方直接使用本组件无需手动包裹 ClientOnly。
 * 支持 v-model 双向绑定与导入/导出方法（通过 ref 调用）。
 */
defineOptions({ inheritAttrs: false });

/** 流程图数据（x6 toJSON 结构） */
export type FlowchartData = { cells: Record<string, unknown>[] };

const model = defineModel<FlowchartData>({
  default: () => ({ cells: [] })
});

const canvasRef = ref<{
  importData: (data: FlowchartData) => void;
  exportData: () => FlowchartData;
  clearGraph: () => void;
} | null>(null);

const FlowchartCanvas = defineAsyncComponent(() => import("./FlowchartCanvas.vue"));

/** 导入数据到画布 */
const importData = (data: FlowchartData): void => {
  canvasRef.value?.importData(data);
};
/** 导出当前画布数据 */
const exportData = (): FlowchartData => {
  return canvasRef.value?.exportData() ?? { cells: [] };
};
/** 清空画布 */
const clearGraph = (): void => {
  canvasRef.value?.clearGraph();
};

defineExpose({ importData, exportData, clearGraph });
</script>

<template>
  <ClientOnly>
    <FlowchartCanvas ref="canvasRef" v-model="model" v-bind="$attrs" />
  </ClientOnly>
</template>
