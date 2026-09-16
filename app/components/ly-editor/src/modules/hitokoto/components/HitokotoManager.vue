<script setup lang="ts">
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import { getAllHitokotoType, deleteHitokotoType } from "@/apis/hitokoto";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();

const { openTabPanel } = useLyEditorTabs();
const { open: openHitokotoTypeForm } = useLyEditorModal("hitokoto-type-form");
const { open: openHitokotoTypeDetails } = useLyEditorModal("hitokoto-type-details");

const data = ref<HitokotoTypeItem[]>([]);
const loading = ref(false);

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await getAllHitokotoType();
  } catch (error) {
    $notify.error({
      title: t("components.lyEditor.modules.hitokoto.loadTypeFailed"),
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const handleOpenBaseFormModal = async (e?: HitokotoTypeItem) => {
  const result = await openHitokotoTypeForm({
    mode: e ? "update" : "create",
    record: e
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleOpenDetailsModal = async (e: HitokotoTypeItem) => {
  await openHitokotoTypeDetails({ record: e });
};

const handleOpenHitokoto = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.HitokotoPanel,
    label: t("components.lyEditor.modules.hitokoto.title"),
    type: LyEditorTabPanelEnum.HitokotoPanel
  });
};

const handleDelete = (e: HitokotoTypeItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteHitokotoType(e.id);
        $notify.success({ title: t("message.delete.success") });
        loadData();
      } catch (error) {
        $notify.error({ title: t("message.operate.error"), error });
      }
    }
  });
};

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.hitokoto.newType"),
    icon: "lucide:plus",
    onClick: handleOpenBaseFormModal
  }
]);

/**
 * 分类节点右键菜单项，按当前分类动态生成。
 */
const getActionItems = (item: HitokotoTypeItem) => [
  {
    label: t("components.lyEditor.modules.hitokoto.typeMenu.rename"),
    icon: "lucide:edit",
    onSelect: () => {
      handleOpenBaseFormModal(item);
    }
  },
  {
    label: t("components.lyEditor.modules.hitokoto.typeMenu.details"),
    icon: "lucide:file-text",
    onSelect: () => {
      handleOpenDetailsModal(item);
    }
  },
  {
    label: t("components.lyEditor.modules.hitokoto.typeMenu.delete"),
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
    :title="t('components.lyEditor.modules.hitokoto.typePanelTitle')"
    :loading="loading"
    :actions="actions"
  >
    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <SidebarPanelListItem
          v-for="item in data"
          :key="item.id"
          :title="item.name"
          :description="item.description"
          :meta-items="[
            {
              text: item.count ?? 0,
              icon: 'lucide:database'
            }
          ]"
          :action-items="getActionItems(item)"
          @click="handleOpenHitokoto"
        />
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
