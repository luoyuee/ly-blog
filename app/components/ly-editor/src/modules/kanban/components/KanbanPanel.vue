<script setup lang="ts">
import type { PropType } from "vue";
import type { EditorTabItem, KanbanPanelData } from "#shared/types/ly-editor";
import type { KanbanData } from "@/components/kanban";
import { Kanban } from "@/components/kanban";
import { getKanbanDetail, updateKanban } from "@/apis/canvas-document";
import { useLogger } from "@/composables/useLogger";

const logger = useLogger();
const $notify = useNotification();

const props = defineProps({
  tab: {
    type: Object as PropType<EditorTabItem & { type: "kanban-panel"; data: KanbanPanelData }>,
    required: true,
    validator: (value: EditorTabItem) => value.type === "kanban-panel"
  }
});

const data = ref<KanbanData>({});
const loading = ref(false);
const saving = ref(false);

/** 生成唯一 id，用于新建列或卡片 */
const genId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

/** 加载看板详情（含核心数据 data） */
const loadData = async () => {
  try {
    loading.value = true;
    const detail = await getKanbanDetail(props.tab.data.id);

    // data 字段按 KanbanData 结构存储
    const documentData = detail.data as KanbanData;
    if (documentData) {
      data.value = documentData;
    }
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "加载看板失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

/** 保存看板数据到后端 */
const handleSave = async () => {
  try {
    saving.value = true;
    await updateKanban({
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

/** 新建列 */
const handleAddColumn = () => {
  const columnId = genId("col");
  data.value = {
    ...data.value,
    [columnId]: []
  };
};

/**
 * 新建卡片
 * @description 直接操作 v-model 数据，在指定列末尾追加卡片 id
 */
const handleAddCard = (columnId: string) => {
  const cardId = genId("card");
  const rows = data.value[columnId] ?? [];
  data.value = {
    ...data.value,
    [columnId]: [...rows, cardId]
  };
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
          icon="lucide:plus"
          size="sm"
          variant="soft"
          :disabled="loading"
          @click="handleAddColumn"
        >
          新建列
        </UButton>
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
    <div class="flex-1 overflow-auto">
      <Kanban v-model="data">
        <template #header="headerProps">
          <div class="flex items-center gap-1 w-full">
            <UIcon name="lucide:grip-vertical" class="kanban-column__grip" aria-hidden="true" />
            <span class="flex-1 truncate">{{ headerProps.id }}</span>
            <UButton
              icon="lucide:plus"
              size="xs"
              variant="ghost"
              title="新建卡片"
              @click.stop="handleAddCard(headerProps.id)"
            />
          </div>
        </template>
      </Kanban>
    </div>
  </div>
</template>
