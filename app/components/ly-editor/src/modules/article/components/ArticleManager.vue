<script setup lang="ts">
import type { ArticleCategory } from "#shared/types/article";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { getAllArticleCategory, deleteArticleCategory } from "@/apis/article";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { useLyEditorModal } from "@ly-editor";
import { lyEditorEmitter } from "@/events";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();

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
    $notify.error({ title: t("components.lyEditor.modules.article.loadCategoryFailed"), error });
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
    label: t("components.lyEditor.modules.article.title"),
    type: LyEditorTabPanelEnum.ArticlePanel
  });
};

const handleDelete = (e: ArticleCategory) => {
  $msgBox.warning({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteArticleCategory(e.id);
        $notify.success({ title: t("message.delete.success") });
        loadData();
      } catch (error) {
        $notify.error({ title: t("message.operate.error"), error });
      }
    }
  });
};

lyEditorEmitter.on("cmd.article-manager:reload", () => {
  loadData();
});

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.article.newCategory"),
    icon: "lucide:plus",
    onClick: handleOpenFormModal
  }
]);
</script>
<template>
  <SidebarPanel :title="$t('components.lyEditor.modules.article.title')" :actions="actions">
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
              label: $t('components.lyEditor.modules.article.categoryMenu.rename'),
              icon: 'lucide:edit',
              onSelect: () => {
                handleOpenFormModal(item);
              }
            },
            {
              label: $t('components.lyEditor.modules.article.categoryMenu.details'),
              icon: 'lucide:info',
              onSelect: () => {
                handleOpenDetailsModal(item);
              }
            },
            {
              label: $t('components.lyEditor.modules.article.categoryMenu.delete'),
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
