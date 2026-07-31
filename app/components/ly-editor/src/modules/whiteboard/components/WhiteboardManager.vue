<script setup lang="ts">
import type { WhiteboardItem } from "#shared/types/ly-editor";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { getAllWhiteboards, deleteWhiteboard } from "@/apis/canvas-document";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";

const $notify = useNotification();
const $msgBox = useMessageBox();
const lyEditorStore = useLyEditorStore();
const { open } = useLyEditorModal("whiteboard-form");

const allData = ref<WhiteboardItem[]>([]);
const loading = ref(false);
const keyword = ref("");

/** 按关键字过滤白板列表 */
const data = computed<WhiteboardItem[]>(() => {
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
    const response = await getAllWhiteboards();
    // 后端返回 CanvasDocumentListItem，与 WhiteboardItem 结构一致
    allData.value = response as WhiteboardItem[];
  } catch (error) {
    $notify.error({
      title: "加载白板列表失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

/** 新建或编辑白板信息 */
const handleOpenFormModal = async (record?: WhiteboardItem) => {
  const result = await open({
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

/** 点击列表项，打开白板编辑标签页 */
const handleOpenWhiteboard = (e: WhiteboardItem) => {
  const key = "whiteboard-panel-" + e.id;

  lyEditorStore.pushTabItem({
    key,
    label: e.title,
    type: LyEditorTabPanelEnum.WhiteboardPanel,
    data: e
  });

  lyEditorStore.currentTab = key;
};

/** 删除白板（软删除） */
const handleDelete = (e: WhiteboardItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.title}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteWhiteboard(e.id);
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
    label: "新建白板",
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
];
</script>
<template>
  <SidebarPanel title="白板管理" :loading="loading" :actions="actions">
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="px-2 py-2">
        <UInput
          v-model.trim="keyword"
          icon="lucide:search"
          class="w-full"
          placeholder="搜索白板标题或描述"
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <Scrollbar class="h-full">
          <SidebarPanelListItem
            v-for="item in data"
            :key="item.id"
            :icon="item.cover ? '' : 'lucide:pencil-sparkles'"
            :title="item.title"
            :description="item.description ?? undefined"
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
                label: '删除白板',
                icon: 'lucide:trash-2',
                color: 'error',
                onSelect: () => {
                  handleDelete(item);
                }
              }
            ]"
            @click="handleOpenWhiteboard(item)"
          />
        </Scrollbar>
      </div>
    </div>
  </SidebarPanel>
</template>
