<script setup lang="ts">
import type { ArticleCategory } from "#shared/types/article";
import { IndeterminateProgressBar } from "@/components/progress";
import { getAllArticleCategory, deleteArticleCategory } from "@/apis/article";
import { useLyEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";
import { lyEditorEmitter } from "@/events";

const $notify = useNotification();
const $msgBox = useMessageBox();

const lyEditorStore = useLyEditorStore();

const data = ref<ArticleCategory[]>([]);

const loadData = async () => {
  try {
    data.value = await getAllArticleCategory();
  } catch (error) {
    $notify.error({ title: "获取数据失败", error });
  }
};

onMounted(() => {
  loadData();
});

const handleOpenFormModal = (e?: ArticleCategory) => {
  lyEditorEmitter.emit("cmd.modal-manager:open:category-form", e);
};

const handleOpenDetailsModal = (e: ArticleCategory) => {
  lyEditorEmitter.emit("cmd.modal-manager:open:category-details", e);
};

const handleOpenHitokoto = (e: ArticleCategory) => {
  lyEditorStore.pushTabItem({
    key: "article-manager",
    label: "文章管理",
    openTime: new Date().getTime(),
    type: "article-manager",
    data: e,
    isChange: true
  });

  lyEditorStore.currentTab = "article-manager";
};

const handleDelete = (e: ArticleCategory) => {
  $msgBox.warning({
    title: "确认删除?",
    message: `即将删除「${e.name}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteArticleCategory(e.id);
        $notify.success({ title: "删除成功" });
        loadData();
      } catch (error) {
        $notify.error({ title: "操作失败", error });
      }
    }
  });
};

lyEditorEmitter.on("cmd.article-manager:reload", () => {
  loadData();
});
</script>
<template>
  <div class="sidebar-manager" @contextmenu.prevent>
    <div class="sidebar-manager__header">
      <div class="sidebar-manager__title"> 文章管理 </div>
      <div class="sidebar-manager__actions">
        <UTooltip text="新建分类">
          <span class="sidebar-manager__actions-item" @click="handleOpenFormModal()">
            <UIcon name="ep:plus" :size="16" />
          </span>
        </UTooltip>
      </div>
    </div>

    <IndeterminateProgressBar :loading="false" />

    <div class="flex-1 overflow-hidden">
      <Scrollbar>
        <div
          v-for="item in data"
          :key="item.id"
          class="px-3 py-2 hover:bg-gray-100/5 cursor-pointer"
          @click="handleOpenHitokoto(item)"
        >
          <div class="flex items-center">
            <UIcon :name="item.icon ?? 'custom-color:folder'" class="mr-1 shrink-0" />
            <span class="truncate">
              {{ item.name }}
            </span>
          </div>
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
                      handleOpenFormModal(item);
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
  </div>
</template>
