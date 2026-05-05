<script setup lang="ts">
import type { HitokotoTypeItem } from "#shared/types/hitokoto";
import { getAllHitokotoType, deleteHitokotoType } from "@/apis/hitokoto";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { LyEditorTabPanel } from "#shared/constants";
import { SidebarPanel } from "../../../components";
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
  const result = await openModal("hitokoto-type-form", e);

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleOpenDetailsModal = async (e: HitokotoTypeItem) => {
  await openModal("hitokoto-type-details", e);
};

const handleOpenHitokoto = () => {
  openTabPanel({
    key: LyEditorTabPanel.HitokotoPanel,
    label: "一言管理",
    type: LyEditorTabPanel.HitokotoPanel
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
    icon: "ep:plus",
    onClick: handleOpenBaseFormModal
  }
];
</script>
<template>
  <SidebarPanel title="一言分类" :loading="loading" :actions="actions">
    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <div
          v-for="item in data"
          :key="item.id"
          class="px-3 py-2 hover:bg-gray-100/5 cursor-pointer"
          @click="handleOpenHitokoto"
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
                <UTooltip text="设置" :content="{ side: 'top' }" ignore-non-keyboard-focus>
                  <UIcon name="custom:setting" class="hover:text-gray-400" />
                </UTooltip>
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
