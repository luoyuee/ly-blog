<script setup lang="ts">
import type { PropType } from "vue";
import type { EditorTabItem, MindmapPanelData } from "#shared/types/ly-editor";
import type { MindmapData } from "@/components/mindmap";
import { Mindmap } from "@/components/mindmap";
import { getMindmapDetail, updateMindmap } from "@/apis/canvas-document";
import { useLogger } from "@/composables/useLogger";

const logger = useLogger();
const $notify = useNotification();

const props = defineProps({
  tab: {
    type: Object as PropType<
      EditorTabItem & { type: "mindmap-panel"; data: MindmapPanelData }
    >,
    required: true,
    validator: (value: EditorTabItem) => value.type === "mindmap-panel"
  }
});

const data = ref<MindmapData>({
  id: "1",
  type: "topic",
  label: "中心主题",
  width: 160,
  height: 50,
  children: []
});
const loading = ref(false);
const saving = ref(false);

/** 加载思维导图详情（含核心数据 data） */
const loadData = async () => {
  try {
    loading.value = true;
    const detail = await getMindmapDetail(props.tab.data.id);

    // data 字段按 MindmapData 结构存储
    const documentData = detail.data as Partial<MindmapData>;
    if (documentData?.id) {
      data.value = documentData as MindmapData;
    }
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "加载思维导图失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

/** 保存思维导图数据到后端 */
const handleSave = async () => {
  try {
    saving.value = true;
    await updateMindmap({
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
      <Mindmap v-model="data" />
    </div>
  </div>
</template>
