<script setup lang="ts">
import type { AttachmentFolder } from "#shared/types/attachment";
import { getAllAttachmentFolder, deleteAttachmentFolder } from "@/apis/attachment";
import { useLyEditorModal } from "@ly-editor";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import Scrollbar from "@/components/scrollbar";
import numeral from "numeral";

const $notify = useNotification();
const $msgBox = useMessageBox();

const { openTabPanel } = useLyEditorTabs();
const { open } = useLyEditorModal("attachment-folder-form");

const data = ref<AttachmentFolder[]>([]);
const loading = ref(false);

/**
 * 加载附件目录列表。
 */
const loadData = async (): Promise<void> => {
  try {
    loading.value = true;
    data.value = await getAllAttachmentFolder();
  } catch (error) {
    $notify.error({
      title: "加载目录失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const handleOpenFormModal = async (record?: AttachmentFolder) => {
  const result = await open({
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleOpenAttachmentFolder = (record: AttachmentFolder) => {
  const key = `attachment-manager-${record.id}`;

  openTabPanel({
    key,
    label: record.name,
    type: LyEditorTabPanelEnum.AttachmentPanel,
    data: record
  });
};

const handleDeleteFolder = (record: AttachmentFolder) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${record.name}」目录，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteAttachmentFolder(record.id);
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
    label: "新建目录",
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
];
</script>

<template>
  <SidebarPanel title="附件管理器" :loading="loading" :actions="actions">
    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <SidebarPanelListItem
          v-for="item in data"
          :key="item.id"
          :icon="item.icon || 'icon-park-outline:folder-open'"
          :title="item.name"
          :description="item.description"
          :meta-items="[
            { text: item.count, icon: 'lucide:file-text' },
            { text: numeral(item.size).format('0.0 b'), icon: 'icon-park-outline:solid-state-disk' }
          ]"
          :action-items="[
            {
              label: '重命名',
              icon: 'lucide:edit',
              onSelect: () => {
                handleOpenFormModal(item);
              }
            },
            {
              label: '删除目录',
              icon: 'lucide:trash-2',
              color: 'error',
              onSelect: () => {
                handleDeleteFolder(item);
              }
            }
          ]"
          @click="handleOpenAttachmentFolder(item)"
        />
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
