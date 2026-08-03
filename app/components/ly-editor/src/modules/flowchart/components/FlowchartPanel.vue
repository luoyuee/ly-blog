<script setup lang="ts">
import type { PropType } from "vue";
import type { EditorTabItem, FlowchartPanelData } from "#shared/types/ly-editor";
import type { FlowchartData } from "@/components/flowchart";
import { Flowchart } from "@/components/flowchart";
import { getFlowchartDetail, updateFlowchart } from "@/apis/canvas-document";
import { useLogger } from "@/composables/useLogger";

const logger = useLogger();
const $notify = useNotification();

const props = defineProps({
  tab: {
    type: Object as PropType<
      EditorTabItem & { type: "flowchart-panel"; data: FlowchartPanelData }
    >,
    required: true,
    validator: (value: EditorTabItem) => value.type === "flowchart-panel"
  }
});

const data = ref<FlowchartData>({ cells: [] });
const loading = ref(false);
const saving = ref(false);

/** 加载流程图详情（含核心数据 data） */
const loadData = async () => {
  try {
    loading.value = true;
    const detail = await getFlowchartDetail(props.tab.data.id);

    // data 字段按 FlowchartData 结构存储
    const documentData = detail.data as Partial<FlowchartData>;
    if (documentData?.cells) {
      data.value = documentData as FlowchartData;
    }
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "加载流程图失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

/** 保存流程图数据到后端 */
const handleSave = async () => {
  try {
    saving.value = true;
    await updateFlowchart({
      id: props.tab.data.id,
      data: data.value as unknown as Record<string, unknown>
    });

    $notify.success({
      title: "保存成功"
    });
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "保存失败",
      error
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 border-b border-white/10">
      <h3 class="text-sm font-medium truncate">{{ props.tab.label }}</h3>
      <div class="flex gap-2">
        <UButton
          icon="lucide:save"
          size="sm"
          :loading="saving"
          :disabled="loading"
          @click="handleSave"
        >
          保存
        </UButton>
      </div>
    </div>
    <div class="flex-1 overflow-hidden">
      <Flowchart v-model="data" />
    </div>
  </div>
</template>
