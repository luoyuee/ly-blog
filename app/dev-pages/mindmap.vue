<script setup lang="ts">
import { ref } from "vue";
import { Mindmap } from "@/components/mindmap";
import type { MindmapData } from "@/components/mindmap";

/**
 * 思维导图组件测试页
 * 用于验证基于 @antv/x6 + @antv/hierarchy 的思维导图组件，支持增删子节点、v-model 双向绑定与 JSON 导入导出
 */

const mindmapData = ref<MindmapData>({
  id: "1",
  type: "topic",
  label: "中心主题",
  width: 160,
  height: 50,
  children: [
    {
      id: "1-1",
      type: "topic-branch",
      label: "分支主题1",
      width: 100,
      height: 40,
      children: [
        { id: "1-1-1", type: "topic-child", label: "子主题1", width: 60, height: 30 },
        { id: "1-1-2", type: "topic-child", label: "子主题2", width: 60, height: 30 }
      ]
    },
    {
      id: "1-2",
      type: "topic-branch",
      label: "分支主题2",
      width: 100,
      height: 40
    }
  ]
});

const mindmapRef = ref<{ exportData: () => MindmapData; importData: (data: MindmapData) => void } | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

/** 导出：将思维导图数据序列化为 JSON 文件下载 */
const exportToFile = (): void => {
  const data = mindmapRef.value?.exportData() ?? mindmapData.value;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = "mindmap.json";
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
};

/** 导入：选择本地 JSON 文件并加载到思维导图 */
const openFilePicker = (): void => {
  fileInputRef.value?.click();
};
const importFromFile = async (event: Event): Promise<void> => {
  const input = event.currentTarget;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.item(0);
  if (!file) return;
  try {
    const data = JSON.parse(await file.text()) as MindmapData;
    mindmapRef.value?.importData(data);
  } catch {
    window.alert("导入思维导图失败，请确认文件为有效 JSON");
  } finally {
    input.value = "";
  }
};

/** 打印当前 v-model 数据（验证双向绑定） */
const logModelData = (): void => {
  console.log("当前 v-model 数据：", mindmapData.value);
};
</script>

<template>
  <main class="flex h-screen flex-col p-4 md:p-8">
    <section class="mx-auto mb-4 w-full max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Mindmap 思维导图组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        基于 @antv/x6 + @antv/hierarchy
        实现的简易思维导图组件，支持自动布局、增删子节点、v-model 双向绑定与 JSON 导入导出。
      </p>
      <ul class="mt-2 list-inside list-disc text-sm text-(--text-color-secondary)">
        <li>选中节点后按 <kbd class="rounded bg-(--ui-bg-elevated) px-1">Tab</kbd> 添加子节点</li>
        <li>选中节点后按 <kbd class="rounded bg-(--ui-bg-elevated) px-1">Backspace</kbd> / <kbd class="rounded bg-(--ui-bg-elevated) px-1">Delete</kbd> 删除节点</li>
        <li>鼠标悬停中心/分支主题节点，点击右侧 <span class="text-primary">+</span> 图标添加子节点</li>
        <li>支持导入/导出 JSON、查看 v-model 数据</li>
      </ul>
    </section>

    <section class="mx-auto mb-3 flex w-full max-w-240 items-center gap-2">
      <UButton color="primary" variant="solid" icon="lucide:download" @click="exportToFile">
        导出 JSON
      </UButton>
      <UButton color="neutral" variant="outline" icon="lucide:upload" @click="openFilePicker">
        导入 JSON
      </UButton>
      <UButton color="neutral" variant="ghost" icon="lucide:terminal" @click="logModelData">
        打印 v-model 数据
      </UButton>
      <input
        ref="fileInputRef"
        hidden
        type="file"
        accept="application/json,.json"
        aria-label="选择思维导图 JSON 文件"
        @change="importFromFile"
      />
    </section>

    <section class="mx-auto min-h-0 w-full max-w-240 flex-1">
      <Mindmap ref="mindmapRef" v-model="mindmapData" class="h-full" />
    </section>
  </main>
</template>
