<script setup lang="ts">
import type { FlowchartItem } from "#shared/types/ly-editor";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { getAllFlowcharts, deleteFlowchart } from "@/apis/canvas-document";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();
const lyEditorStore = useLyEditorStore();
const { open } = useLyEditorModal("flowchart-form");

const allData = ref<FlowchartItem[]>([]);
const loading = ref(false);
const keyword = ref("");

/** 按关键字过滤流程图列表 */
const data = computed<FlowchartItem[]>(() => {
  if (!keyword.value) return allData.value;
  const kw = keyword.value.toLowerCase();
  return allData.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(kw) ||
      (item.description?.toLowerCase().includes(kw) ?? false)
    );
  });
});

const loadData = async (): Promise<void> => {
  try {
    loading.value = true;
    const response = await getAllFlowcharts();
    allData.value = response as FlowchartItem[];
  } catch (error) {
    $notify.error({
      title: t("components.lyEditor.modules.flowchart.loadFailed"),
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

/** 新建或编辑流程图信息 */
const handleOpenFormModal = async (record?: FlowchartItem) => {
  const result = await open({
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

/** 点击列表项，打开流程图编辑标签页 */
const handleOpenFlowchart = (e: FlowchartItem) => {
  const key = "flowchart-panel-" + e.id;

  lyEditorStore.pushTabItem({
    key,
    label: e.title,
    type: LyEditorTabPanelEnum.FlowchartPanel,
    data: e
  });

  lyEditorStore.currentTab = key;
};

/** 删除流程图（软删除） */
const handleDelete = (e: FlowchartItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.title }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteFlowchart(e.id);
        $notify.success({
          title: t("message.delete.success")
        });
        await loadData();
      } catch (error) {
        $notify.error({
          title: t("message.delete.error"),
          error
        });
      }
    }
  });
};

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.flowchart.new"),
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
]);

/**
 * 列表项操作菜单，按当前流程图动态生成。
 */
const getActionItems = (item: FlowchartItem) => [
  {
    label: t("components.lyEditor.modules.flowchart.menu.editInfo"),
    icon: "lucide:edit",
    onSelect: () => {
      handleOpenFormModal(item);
    }
  },
  {
    label: t("components.lyEditor.modules.flowchart.menu.delete"),
    icon: "lucide:trash-2",
    color: "error",
    onSelect: () => {
      handleDelete(item);
    }
  }
];
</script>
<template>
  <SidebarPanel
    :title="t('components.lyEditor.modules.flowchart.title')"
    :loading="loading"
    :actions="actions"
  >
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="px-2 py-2">
        <UInput
          v-model.trim="keyword"
          icon="lucide:search"
          class="w-full"
          :placeholder="t('components.lyEditor.modules.flowchart.searchPlaceholder')"
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <Scrollbar class="h-full">
          <SidebarPanelListItem
            v-for="item in data"
            :key="item.id"
            :icon="item.cover ? '' : 'lucide:workflow'"
            :title="item.title"
            :description="item.description ?? undefined"
            :meta-items="[{ text: item.id, icon: 'lucide:hash' }]"
            :action-items="getActionItems(item)"
            @click="handleOpenFlowchart(item)"
          />
        </Scrollbar>
      </div>
    </div>
  </SidebarPanel>
</template>
