<script setup lang="ts">
import type { WorkItem } from "#shared/types/config";
import { IndeterminateProgressBar } from "@/components/progress";
import { getWorkConfig, updateWorkConfig } from "@/apis/config";
import WorkFormModal from "./WorkFormModal.vue";
import Scrollbar from "@/components/scrollbar";
import { VueDraggable } from "vue-draggable-plus";

const $notify = useNotification();
const $msgBox = useMessageBox();

const data = ref<WorkItem[]>([]);

const loadData = async () => {
  try {
    data.value = await getWorkConfig();
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

const workFormModalRef = useTemplateRef("workFormModalRef");

const handleOpenFormModal = (e?: WorkItem) => {
  workFormModalRef.value?.open(e);
};

const handleDelete = (e: WorkItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.name}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        const formData = data.value.filter((item) => item.repoUrl !== e.repoUrl);
        await updateWorkConfig(formData);
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

const handleDragEnd = async () => {
  try {
    await updateWorkConfig(data.value);
  } catch (error) {
    loadData();
    $notify.error({
      title: "操作失败",
      error
    });
  }
};
</script>
<template>
  <div class="mdc-image-manager" @contextmenu.prevent>
    <div class="header">
      <div class="whitespace-nowrap text-ellipsis overflow-hidden"> 项目管理 </div>
      <div class="actions">
        <UTooltip text="新建项目">
          <span @click="handleOpenFormModal()">
            <UIcon name="ep:plus" :size="16" />
          </span>
        </UTooltip>
      </div>
    </div>

    <IndeterminateProgressBar :loading="false" />

    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <VueDraggable
          v-model="data"
          target=".works-container"
          :animation="150"
          :on-end="handleDragEnd"
        >
          <div class="flex flex-col gap-2 p-2 works-container">
            <div
              v-for="item in data"
              :key="item.repoUrl"
              class="px-3 py-2 bg-(--mdc-editor-toolbar-background) hover:bg-gray-100/5 rounded-xs"
            >
              <h6 class="flex items-center justify-between">
                <span class="flex-1 mr-2 truncate">
                  {{ `${item.icon} ${item.name}` }}
                </span>

                <UDropdownMenu
                  :items="[
                    {
                      label: '编辑信息',
                      icon: 'ep:edit',
                      onSelect: () => {
                        handleOpenFormModal(item);
                      }
                    },
                    {
                      label: '删除项目',
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
                  <UTooltip text="菜单">
                    <UIcon name="custom:menu-button" class="hover:text-gray-400" :size="20" />
                  </UTooltip>
                </UDropdownMenu>
              </h6>

              <p class="break-all my-2 text-sm" :title="item.description">
                {{ item.description }}
              </p>

              <img
                :src="item.image"
                :alt="item.image"
                class="w-full rounded-xs max-h-64 object-cover"
              />

              <a class="flex my-2 hover:text-primary" :href="item.repoUrl" target="_blank">
                <UIcon name="custom:github" class="mr-1 shrink-0" :size="16" />
                <span class="text-xs break-all">{{ item.repoUrl }}</span>
              </a>

              <div class="flex flex-wrap gap-1">
                <span
                  v-for="lang in item.languages"
                  :key="lang"
                  class="text-xs text-gray-400 rounded-full px-2 bg-gray-500/50"
                >
                  {{ lang }}
                </span>
              </div>
            </div>
          </div>
        </VueDraggable>
      </Scrollbar>
    </div>

    <WorkFormModal ref="workFormModalRef" :works="data" @submit="loadData" />
  </div>
</template>
<style scoped lang="scss">
.mdc-image-manager {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .header {
    color: #d5d5d5;
    font-size: 0.875rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2b2b2b;
    height: 34px;
    padding: 0 6px;
    line-height: 1;

    .actions {
      display: flex;
      align-items: center;

      > span {
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        &:hover {
          background-color: rgba(235, 240, 250, 0.06);
        }
      }
    }
  }

  .image-foler-card {
    display: flex;
  }
}
</style>
