<script setup lang="ts">
import type { MindmapItem } from "#shared/types/ly-editor";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { getAllMindmaps, deleteMindmap } from "@/apis/canvas-document";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();
const lyEditorStore = useLyEditorStore();
const { open } = useLyEditorModal("mindmap-form");

const allData = ref<MindmapItem[]>([]);
const loading = ref(false);
const keyword = ref("");

/** 按关键字过滤思维导图列表 */
const data = computed<MindmapItem[]>(() => {
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
    const response = await getAllMindmaps();
    allData.value = response as MindmapItem[];
  } catch (error) {
    $notify.error({
      title: t("components.lyEditor.modules.mindmap.loadFailed"),
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

/** 新建或编辑思维导图信息 */
const handleOpenFormModal = async (record?: MindmapItem) => {
  const result = await open({
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

/** 点击列表项，打开思维导图编辑标签页 */
const handleOpenMindmap = (e: MindmapItem) => {
  const key = "mindmap-panel-" + e.id;

  lyEditorStore.pushTabItem({
    key,
    label: e.title,
    type: LyEditorTabPanelEnum.MindmapPanel,
    data: e
  });

  lyEditorStore.currentTab = key;
};

/** 删除思维导图（软删除） */
const handleDelete = (e: MindmapItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.title }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteMindmap(e.id);
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
    label: t("components.lyEditor.modules.mindmap.new"),
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
]);

/**
 * 列表项操作菜单，按当前思维导图动态生成。
 */
const getActionItems = (item: MindmapItem) => [
  {
    label: t("components.lyEditor.modules.mindmap.menu.editInfo"),
    icon: "lucide:edit",
    onSelect: () => {
      handleOpenFormModal(item);
    }
  },
  {
    label: t("components.lyEditor.modules.mindmap.menu.delete"),
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
    :title="t('components.lyEditor.modules.mindmap.title')"
    :loading="loading"
    :actions="actions"
  >
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="px-2 py-2">
        <UInput
          v-model.trim="keyword"
          icon="lucide:search"
          class="w-full"
          :placeholder="t('components.lyEditor.modules.mindmap.searchPlaceholder')"
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <Scrollbar class="h-full">
          <SidebarPanelListItem
            v-for="item in data"
            :key="item.id"
            :icon="item.cover ? '' : 'lucide:network'"
            :title="item.title"
            :description="item.description ?? undefined"
            :meta-items="[{ text: item.id, icon: 'lucide:hash' }]"
            :action-items="getActionItems(item)"
            @click="handleOpenMindmap(item)"
          />
        </Scrollbar>
      </div>
    </div>
  </SidebarPanel>
</template>
