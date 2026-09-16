<script setup lang="ts">
import type { ImageFolder } from "#shared/types/image";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { getAllImageFolder } from "@/apis/image";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();

const lyEditorStore = useLyEditorStore();
const { open } = useLyEditorModal("image-folder-form");

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
  const result = await open({ record });

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

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.image.newFolder"),
    icon: "lucide:plus",
    onClick: handleOpenFormModal
  }
]);
</script>
<template>
  <SidebarPanel
    :title="$t('components.lyEditor.modules.image.title')"
    :loading="loading"
    :actions="actions"
  >
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
              label: $t('components.lyEditor.modules.image.menu.rename'),
              icon: 'lucide:edit',
              onSelect: () => {
                handleOpenFormModal(item);
              }
            },
            {
              label: $t('components.lyEditor.modules.image.menu.details'),
              icon: 'lucide:info'
            },
            {
              label: $t('components.lyEditor.modules.image.menu.delete'),
              icon: 'lucide:trash-2',
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
