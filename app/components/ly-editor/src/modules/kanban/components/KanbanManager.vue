<script setup lang="ts">
import type { KanbanItem } from "#shared/types/ly-editor";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { getAllKanbans, deleteKanban } from "@/apis/canvas-document";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";

const $notify = useNotification();
const $msgBox = useMessageBox();
const lyEditorStore = useLyEditorStore();
const { open } = useLyEditorModal("kanban-form");

const allData = ref<KanbanItem[]>([]);
const loading = ref(false);
const keyword = ref("");

/** 按关键字过滤看板列表 */
const data = computed<KanbanItem[]>(() => {
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
    const response = await getAllKanbans();
    allData.value = response as KanbanItem[];
  } catch (error) {
    $notify.error({
      title: "加载看板列表失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

/** 新建或编辑看板信息 */
const handleOpenFormModal = async (record?: KanbanItem) => {
  const result = await open({
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

/** 点击列表项，打开看板编辑标签页 */
const handleOpenKanban = (e: KanbanItem) => {
  const key = "kanban-panel-" + e.id;

  lyEditorStore.pushTabItem({
    key,
    label: e.title,
    type: LyEditorTabPanelEnum.KanbanPanel,
    data: e
  });

  lyEditorStore.currentTab = key;
};

/** 删除看板（软删除） */
const handleDelete = (e: KanbanItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.title}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteKanban(e.id);
        $notify.success({
          title: "删除成功"
        });
        await loadData();
      } catch (error) {
        $notify.error({
          title: "删除失败",
          error
        });
      }
    }
  });
};

const actions = [
  {
    label: "新建看板",
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
];
</script>
<template>
  <SidebarPanel title="看板管理" :loading="loading" :actions="actions">
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="px-2 py-2">
        <UInput
          v-model.trim="keyword"
          icon="lucide:search"
          class="w-full"
          placeholder="搜索看板标题或描述"
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <Scrollbar class="h-full">
          <SidebarPanelListItem
            v-for="item in data"
            :key="item.id"
            :icon="item.cover ? '' : 'lucide:square-kanban'"
            :title="item.title"
            :description="item.description"
            :meta-items="[{ text: item.id, icon: 'lucide:hash' }]"
            :action-items="[
              {
                label: '编辑信息',
                icon: 'lucide:edit',
                onSelect: () => {
                  handleOpenFormModal(item);
                }
              },
              {
                label: '删除看板',
                icon: 'lucide:trash-2',
                color: 'error',
                onSelect: () => {
                  handleDelete(item);
                }
              }
            ]"
            @click="handleOpenKanban(item)"
          />
        </Scrollbar>
      </div>
    </div>
  </SidebarPanel>
</template>
