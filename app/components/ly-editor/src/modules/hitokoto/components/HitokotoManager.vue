<script setup lang="ts">
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import { getAllHitokotoType, deleteHitokotoType } from "@/apis/hitokoto";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import Scrollbar from "@/components/scrollbar";

const $notify = useNotification();
const $msgBox = useMessageBox();

const { openTabPanel } = useLyEditorTabs();
const { openModal } = useLyEditorModal();

const data = ref<HitokotoTypeItem[]>([]);
const loading = ref(false);

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await getAllHitokotoType();
  } catch (error) {
    $notify.error({
      title: "加载分类失败",
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
  const result = await openModal("hitokoto-type-form", {
    mode: e ? "update" : "create",
    record: e
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleOpenDetailsModal = async (e: HitokotoTypeItem) => {
  await openModal("hitokoto-type-details", e);
};

const handleOpenHitokoto = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.HitokotoPanel,
    label: "一言管理",
    type: LyEditorTabPanelEnum.HitokotoPanel
  });
};

const handleDelete = (e: HitokotoTypeItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.name}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteHitokotoType(e.id);
        $notify.success({ title: "删除成功" });
        loadData();
      } catch (error) {
        $notify.error({ title: "操作失败", error });
      }
    }
  });
};

const actions = [
  {
    label: "新建分类",
    icon: "lucide:plus",
    onClick: handleOpenBaseFormModal
  }
];
</script>
<template>
  <SidebarPanel title="一言分类" :loading="loading" :actions="actions">
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
          :action-items="[
            {
              label: '重命名',
              icon: 'lucide:edit',
              onSelect: () => {
                handleOpenBaseFormModal(item);
              }
            },
            {
              label: '分类详情',
              icon: 'lucide:file-text',
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
          @click="handleOpenHitokoto"
        />
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
