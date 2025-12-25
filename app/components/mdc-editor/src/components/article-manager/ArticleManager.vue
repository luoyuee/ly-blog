<script setup lang="ts">
import type { ArticleCategory } from "#shared/types/article";
import { IndeterminateProgressBar } from "@/components/progress";
import { getAllArticleCategory, deleteArticleCategory } from "@/apis/article";
import { useMdcEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";
import { mdcEditorEmitter } from "@/events";

const $notify = useNotification();
const $msgBox = useMessageBox();

const mdcEditorStore = useMdcEditorStore();

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
  mdcEditorEmitter.emit("cmd.modal-manager:open:category-form", e);
};

const handleOpenDetailsModal = (e: ArticleCategory) => {
  mdcEditorEmitter.emit("cmd.modal-manager:open:category-details", e);
};

const handleOpenHitokoto = (e: ArticleCategory) => {
  mdcEditorStore.pushTabItem({
    key: "article-manager",
    label: "文章管理",
    openTime: new Date().getTime(),
    type: "article-manager",
    data: e,
    isChange: true
  });

  mdcEditorStore.currenTab = "article-manager";
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

mdcEditorEmitter.on("cmd.article-manager:reload", () => {
  loadData();
});
</script>
<template>
  <div class="mdc-article-category-manager" @contextmenu.prevent>
    <div class="header">
      <div class="whitespace-nowrap text-ellipsis overflow-hidden"> 文章管理 </div>
      <div class="actions">
        <span @click="handleOpenFormModal()">
          <UIcon name="ep:plus" :size="16" />
        </span>
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
<style scoped lang="scss">
.mdc-article-category-manager {
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
