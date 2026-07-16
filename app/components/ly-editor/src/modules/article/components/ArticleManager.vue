<script setup lang="ts">
import type { ArticleCategory } from "#shared/types/article";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { getAllArticleCategory, deleteArticleCategory } from "@/apis/article";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { useLyEditorModal } from "@ly-editor";
import { lyEditorEmitter } from "@/events";
import Scrollbar from "@/components/scrollbar";

const $notify = useNotification();
const $msgBox = useMessageBox();

const { open: openCategoryFormModal } = useLyEditorModal("category-form");
const { open: openCategoryDetailsModal } = useLyEditorModal("category-details");
const { openTabPanel } = useLyEditorTabs();

const data = ref<ArticleCategory[]>([]);

const loadData = async () => {
  try {
    data.value = await getAllArticleCategory();
  } catch (error) {
    $notify.error({ title: "获取数据失败", error });
  }
};

onMounted(() => {
  loadData();
});

const handleOpenFormModal = async (e?: ArticleCategory) => {
  const result = await openCategoryFormModal({ form: e });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleOpenDetailsModal = async (e: ArticleCategory) => {
  await openCategoryDetailsModal({ category: e });
};

const handleOpenPanel = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.ArticlePanel,
    label: "文章管理",
    type: LyEditorTabPanelEnum.ArticlePanel
  });
};

const handleDelete = (e: ArticleCategory) => {
  $msgBox.warning({
    title: "确认删除?",
    message: `即将删除「${e.name}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteArticleCategory(e.id);
        $notify.success({ title: "删除成功" });
        loadData();
      } catch (error) {
        $notify.error({ title: "操作失败", error });
      }
    }
  });
};

lyEditorEmitter.on("cmd.article-manager:reload", () => {
  loadData();
});

const actions = [
  {
    label: "新建分类",
    icon: "lucide:plus",
    onClick: handleOpenFormModal
  }
];
</script>
<template>
  <SidebarPanel title="文章管理" :actions="actions">
    <div class="flex-1 overflow-hidden">
      <Scrollbar>
        <SidebarPanelListItem
          v-for="item in data"
          :key="item.id"
          :icon="item.icon ?? 'colorful:folder'"
          :title="item.name"
          :description="item.description"
          :meta-items="[{ text: item.count ?? 0, icon: 'lucide:file-text' }]"
          :action-items="[
            {
              label: '重命名',
              icon: 'lucide:edit',
              onSelect: () => {
                handleOpenFormModal(item);
              }
            },
            {
              label: '分类详情',
              icon: 'lucide:info',
              onSelect: () => {
                handleOpenDetailsModal(item);
              }
            },
            {
              label: '删除分类',
              icon: 'lucide:trash-2',
              color: 'error',
              onSelect: () => {
                handleDelete(item);
              }
            }
          ]"
          @click="handleOpenPanel"
        />
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
