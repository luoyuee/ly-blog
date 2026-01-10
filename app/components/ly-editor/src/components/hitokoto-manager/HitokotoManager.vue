<script setup lang="ts">
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import { IndeterminateProgressBar } from "@/components/progress";
import { getAllHitokotoType, deleteHitokotoType } from "@/apis/hitokoto";
import { useLyEditorStore } from "@/stores";
import HitokotoTypeFormModal from "./HitokotoTypeFormModal.vue";
import HitokotoTypeDetailsModal from "./HitokotoTypeDetailsModal.vue";
import Scrollbar from "@/components/scrollbar";
import { LyEditorTabPanelEnum } from "@@/shared/enums";

const $notify = useNotification();
const $msgBox = useMessageBox();

const lyEditorStore = useLyEditorStore();

const data = ref<HitokotoTypeItem[]>([]);

const loadData = async () => {
  try {
    data.value = await getAllHitokotoType();
  } catch (error) {
    $notify.error({
      title: "操作失败",
      error
    });
  }
};

onMounted(() => {
  loadData();
});

const hitokotoTypeBaseFormModalRef = useTemplateRef("hitokotoTypeFormModalRef");
const hitokotoTypeDetailsModalRef = useTemplateRef("hitokotoTypeDetailsModalRef");

const handleOpenBaseFormModal = (e?: HitokotoTypeItem) => {
  hitokotoTypeBaseFormModalRef.value?.open(e);
};

const handleOpenDetailsModal = (e: HitokotoTypeItem) => {
  hitokotoTypeDetailsModalRef.value?.open(e);
};

const handleOpenHitokoto = (e: HitokotoTypeItem) => {
  lyEditorStore.pushTabItem({
    key: "hitokoto-manager",
    label: "一言管理",
    type: LyEditorTabPanelEnum.HitokotoPanel,
    data: e
  });

  lyEditorStore.currentTab = LyEditorTabPanelEnum.HitokotoPanel;
};

const handleDelete = (e: HitokotoTypeItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.name}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteHitokotoType(e.id);
        $notify.success({
          title: "删除成功"
        });
        loadData();
      } catch (error) {
        $notify.error({
          title: "操作失败",
          error
        });
      }
    }
  });
};
</script>
<template>
  <div class="sidebar-manager" @contextmenu.prevent>
    <div class="sidebar-manager__header">
      <div class="sidebar-manager__title"> 一言分类 </div>
      <div class="sidebar-manager__actions">
        <UTooltip text="新建分类">
          <span class="sidebar-manager__actions-item" @click="handleOpenBaseFormModal()">
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
          class="px-3 py-2 hover:bg-gray-100/5 cursor-pointer"
          @click="handleOpenHitokoto(item)"
        >
          <h6 class="truncate">{{ item.name }}</h6>
          <p class="text-xs text-gray-400 truncate" :title="item.description">
            {{ item.description }}
          </p>
          <div class="flex justify-between items-center leading-none pt-1">
            <div class="text-xs flex items-center gap-1">
              <UIcon name="custom:database" />
              {{ item.count }}
            </div>
            <div class="flex items-center gap-1" @click.stop>
              <UDropdownMenu
                :items="[
                  {
                    label: '重命名',
                    icon: 'ep:edit',
                    onSelect: () => {
                      handleOpenBaseFormModal(item);
                    }
                  },
                  {
                    label: '分类详情',
                    icon: 'ep:warning',
                    onSelect: () => {
                      handleOpenDetailsModal(item);
                    }
                  },
                  {
                    label: '删除分类',
                    icon: 'ep:delete',
                    color: 'error',
                    onSelect: () => {
                      handleDelete(item);
                    }
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
      </Scrollbar>
    </div>

    <HitokotoTypeFormModal ref="hitokotoTypeFormModalRef" @submit="loadData" />
    <HitokotoTypeDetailsModal ref="hitokotoTypeDetailsModalRef" />
  </div>
</template>
