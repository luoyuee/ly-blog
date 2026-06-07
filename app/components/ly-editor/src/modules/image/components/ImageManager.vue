<script setup lang="ts">
import type { ImageFolder } from "#shared/types/image";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { getAllImageFolder } from "@/apis/image";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";

const lyEditorStore = useLyEditorStore();
const { openModal } = useLyEditorModal();

const data = ref<ImageFolder[]>([]);
const loading = ref(false);

const loadData = async (): Promise<void> => {
  try {
    loading.value = true;
    const response = await getAllImageFolder();
    data.value = response;
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: String(error),
      color: "error"
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const handleOpenFormModal = async (record?: ImageFolder) => {
  const result = await openModal("image-folder-form", record);

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleOpenImageFolder = (e: ImageFolder) => {
  const key = "image-manager-" + e.id;

  lyEditorStore.pushTabItem({
    key,
    label: e.name,
    type: LyEditorTabPanelEnum.ImagePanel,
    data: e
  });

  lyEditorStore.currentTab = key;
};

const actions = [
  {
    label: "新建目录",
    icon: "ep:plus",
    onClick: handleOpenFormModal
  }
];
</script>
<template>
  <SidebarPanel title="图片管理器" :loading="loading" :actions="actions">
    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <SidebarPanelListItem
          v-for="item in data"
          :key="item.id"
          :image="item.cover ? `/static/image/${item.cover}` : '/images/no_pictures.svg'"
          :title="item.name"
          :description="item.description"
          :meta-items="[{ text: item.count, icon: 'custom:pic' }]"
          :action-items="[
            {
              label: '重命名',
              icon: 'ep:edit',
              onSelect: () => {
                handleOpenFormModal(item);
              }
            },
            {
              label: '目录详情',
              icon: 'ep:warning'
            },
            {
              label: '删除目录',
              icon: 'ep:delete',
              color: 'error',
              disabled: item.is_system
            }
          ]"
          @click="handleOpenImageFolder(item)"
        />
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
