<script setup lang="ts">
import type { AttachmentFolder } from "#shared/types/attachment";
import { LyEditorTabPanel } from "#shared/constants";
import { getAllAttachmentFolder, deleteAttachmentFolder } from "@/apis/attachment";
import { SidebarPanel } from "../../../components";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import Scrollbar from "@/components/scrollbar";
import numeral from "numeral";

const $notify = useNotification();
const $msgBox = useMessageBox();

const { openTabPanel } = useLyEditorTabs();
const { openModal } = useLyEditorModal();

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
  const result = await openModal("attachment-folder-form", {
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
    type: LyEditorTabPanel.AttachmentPanel,
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
    icon: "ep:plus",
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
        <div
          v-for="item in data"
          :key="item.id"
          class="flex items-start gap-3 p-3 hover:bg-gray-100/5 cursor-pointer"
          @click="handleOpenAttachmentFolder(item)"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100/5">
            <UIcon name="ep:folder-opened" class="text-lg text-gray-300" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h6 class="truncate">{{ item.name }}</h6>
                <p class="truncate text-xs text-gray-400">
                  {{ item.description || "暂无目录描述" }}
                </p>
              </div>

              <div class="flex items-center gap-1" @click.stop>
                <UDropdownMenu
                  :items="[
                    {
                      label: '重命名',
                      icon: 'ep:edit',
                      onSelect: () => {
                        handleOpenFormModal(item);
                      }
                    },
                     {
                       label: '删除目录',
                       icon: 'ep:delete',
                       color: 'error',
                       onSelect: () => {
                         handleDeleteFolder(item);
                       }
                     }
                  ]"
                  :content="{
                    align: 'start',
                    side: 'bottom',
                    sideOffset: 8
                  }"
                >
                  <UTooltip text="设置">
                    <UIcon name="custom:setting" class="hover:text-gray-400" :size="16" />
                  </UTooltip>
                </UDropdownMenu>
              </div>
            </div>

            <div class="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="ep:document" />
                {{ item.count }}
              </span>
              <span>{{ numeral(item.size).format("0.0 b") }}</span>
            </div>
          </div>
        </div>
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
