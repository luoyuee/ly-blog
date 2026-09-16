<script setup lang="ts">
import type { AttachmentFolder } from "#shared/types/attachment";
import { getAllAttachmentFolder, deleteAttachmentFolder } from "@/apis/attachment";
import { useLyEditorModal } from "@ly-editor";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import Scrollbar from "@/components/scrollbar";
import numeral from "numeral";

const { t } = useI18n();

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
      title: t("components.lyEditor.modules.attachment.loadFolderFailed"),
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
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: record.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteAttachmentFolder(record.id);
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
    label: t("components.lyEditor.modules.attachment.newFolder"),
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
]);
</script>

<template>
  <SidebarPanel
    :title="$t('components.lyEditor.modules.attachment.title')"
    :loading="loading"
    :actions="actions"
  >
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
              label: $t('components.lyEditor.modules.attachment.folderMenu.rename'),
              icon: 'lucide:edit',
              onSelect: () => {
                handleOpenFormModal(item);
              }
            },
            {
              label: $t('components.lyEditor.modules.attachment.folderMenu.delete'),
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
