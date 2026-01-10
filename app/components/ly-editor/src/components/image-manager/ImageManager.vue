<script setup lang="ts">
import type { ImageFolder } from "#shared/types/image";
import IndeterminateProgressBar from "../progress/IndeterminateProgressBar.vue";
import Scrollbar from "@/components/scrollbar";
import { getAllImageFolder } from "@/apis/image";
import ImageFolderFormModal from "./ImageFolderFormModal.vue";
import { LyEditorTabPanelEnum } from "@@/shared/enums";
import { useLyEditorStore } from "@/stores";

const lyEditorStore = useLyEditorStore();

const data = ref<ImageFolder[]>([]);

const loadData = async (): Promise<void> => {
  try {
    const response = await getAllImageFolder();
    data.value = response;
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: String(error),
      color: "error"
    });
  }
};

onMounted(() => {
  loadData();
});

const imageFolderFormModalRef = useTemplateRef("imageFolderFormModalRef");

const handleOpenFormModal = (e?: ImageFolder) => {
  imageFolderFormModalRef.value?.open(e);
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
</script>
<template>
  <div class="sidebar-manager" @contextmenu.prevent>
    <div class="sidebar-manager__header">
      <div class="sidebar-manager__title"> 图片管理器 </div>
      <div class="sidebar-manager__actions">
        <UTooltip text="新建目录">
          <span class="sidebar-manager__actions-item" @click="handleOpenFormModal()">
            <UIcon name="ep:plus" :size="16" />
          </span>
        </UTooltip>
      </div>
    </div>

    <IndeterminateProgressBar :loading="false" />

    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <div
          v-for="item in data"
          :key="item.id"
          class="flex p-2 hover:bg-gray-100/5 cursor-pointer"
          @click="handleOpenImageFolder(item)"
        >
          <img
            class="w-16 h-16 rounded object-cover"
            :src="item.cover ? `/static/image/${item.cover}` : '/images/no_pictures.svg'"
            alt="cover"
          />
          <div class="pl-2 flex-1 overflow-hidden flex flex-col">
            <h6 class="truncate">{{ item.name }}</h6>
            <p class="flex-1 text-xs text-gray-400 truncate">
              {{ item.description }}
            </p>
            <div class="flex justify-between items-center leading-none">
              <div class="text-xs flex items-center gap-1">
                <UIcon name="custom:pic" />
                {{ item.count }}
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
                  :content="{
                    align: 'start',
                    side: 'bottom',
                    sideOffset: 8
                  }"
                  :ui="{
                    content: 'w-48'
                  }"
                >
                  <UTooltip text="设置">
                    <UIcon name="custom:setting" class="hover:text-gray-400" :size="16" />
                  </UTooltip>
                </UDropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Scrollbar>
    </div>

    <ImageFolderFormModal ref="imageFolderFormModalRef" @submit="loadData" />
  </div>
</template>
