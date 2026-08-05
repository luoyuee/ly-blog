<script setup lang="ts">
import { ref } from "vue";
import { Flowchart } from "@/components/flowchart";
import type { FlowchartData } from "@/components/flowchart";

/**
 * 流程图组件测试页
 * 用于验证基于 @antv/x6 的流程图组件，支持从 stencil 拖拽节点、连线、快捷键操作
 */

const flowchartData = ref<FlowchartData>({ cells: [] });
const flowchartRef = ref<{ exportData: () => FlowchartData; importData: (data: FlowchartData) => void; clearGraph: () => void } | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

/** 导出：将画布数据序列化为 JSON 文件下载 */
const exportToFile = (): void => {
  const data = flowchartRef.value?.exportData() ?? { cells: [] };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = "flowchart.json";
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
};

/** 导入：选择本地 JSON 文件并加载到画布 */
const openFilePicker = (): void => {
  fileInputRef.value?.click();
};
const importFromFile = async (event: Event): Promise<void> => {
  const input = event.currentTarget;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.item(0);
  if (!file) return;
  try {
    const data = JSON.parse(await file.text()) as FlowchartData;
    flowchartRef.value?.importData(data);
  } catch {
    window.alert("导入流程图失败，请确认文件为有效 JSON");
  } finally {
    input.value = "";
  }
};

/** 打印当前 v-model 数据（验证双向绑定） */
const logModelData = (): void => {
  console.log("当前 v-model 数据：", flowchartData.value);
};
</script>

<template>
  <main class="flex h-screen flex-col p-4 md:p-8">
    <section class="mx-auto mb-4 w-full max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Flowchart 流程图组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        基于 @antv/x6
        实现的简易流程图组件，支持从左侧面板拖拽节点、连接桩连线、快捷键操作（复制/粘贴/撤销/重做/删除/缩放）、v-model 双向绑定与 JSON 导入导出。
      </p>
      <ul class="mt-2 list-inside list-disc text-sm text-(--text-color-secondary)">
        <li>从左侧 Stencil 面板拖拽节点到画布</li>
        <li>鼠标悬停节点显示连接桩，拖拽连接桩进行连线</li>
        <li>Ctrl + 滚轮缩放画布，Ctrl+1/2 放大/缩小</li>
        <li>Ctrl+C/X/V 复制/剪切/粘贴，Ctrl+Z/Y 撤销/重做</li>
        <li>Backspace 删除选中节点</li>
      </ul>
    </section>

    <section class="mx-auto mb-3 flex w-full max-w-240 items-center gap-2">
      <UButton color="primary" variant="solid" icon="lucide:download" @click="exportToFile">
        导出 JSON
      </UButton>
      <UButton color="neutral" variant="outline" icon="lucide:upload" @click="openFilePicker">
        导入 JSON
      </UButton>
      <UButton color="neutral" variant="outline" icon="lucide:trash-2" @click="flowchartRef?.clearGraph()">
        清空画布
      </UButton>
      <UButton color="neutral" variant="ghost" icon="lucide:terminal" @click="logModelData">
        打印 v-model 数据
      </UButton>
      <input
        ref="fileInputRef"
        hidden
        type="file"
        accept="application/json,.json"
        aria-label="选择流程图 JSON 文件"
        @change="importFromFile"
      />
    </section>

    <section class="mx-auto min-h-0 w-full max-w-240 flex-1">
      <Flowchart ref="flowchartRef" v-model="flowchartData" class="h-full" />
    </section>
  </main>
</template>
