<script setup lang="ts">
import type { SearchEngineItem } from "#shared/types/navigation-website";
import { getSearchEngineList, deleteSearchEngine } from "~/apis/navigation-website";
import { lyEditorEmitter } from "~/events";

const $notify = useNotification();
const $msgBox = useMessageBox();

const searchEngines = ref<SearchEngineItem[]>([]);

const loadSearchEngines = async () => {
  try {
    const res = await getSearchEngineList();
    searchEngines.value = res.data;
  } catch (error) {
    $notify.error({ title: "操作失败", error });
  }
};

lyEditorEmitter.on("notify.search-engine-form:submitted", loadSearchEngines);

onMounted(() => {
  loadSearchEngines();
});

const handleOpenSearchEngineFormModal = async (e?: SearchEngineItem) => {
  const result = await openWorkspaceModal("search-engine-form", e);

  if (result.action === "submitted") {
    await loadSearchEngines();
  }
};

const handleDeleteSearchEngine = (e: SearchEngineItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除搜索引擎「${e.name}」，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteSearchEngine(e.id);
        $notify.success({ title: "删除成功" });
        loadSearchEngines();
      } catch (error) {
        $notify.error({ title: "操作失败", error });
      }
    }
  });
};
</script>
<template>
  <div class="flex-1 flex flex-col min-h-0">
    <div class="flex items-center justify-between px-2 py-1.5 shrink-0 border-b border-gray-700">
      <span class="text-xs font-medium text-gray-400">搜索引擎</span>
      <UTooltip text="新增搜索引擎">
        <UButton
          size="xs"
          icon="lucide:plus"
          color="neutral"
          variant="ghost"
          @click="handleOpenSearchEngineFormModal()"
        />
      </UTooltip>
    </div>
    <div class="flex-1 overflow-y-auto px-1 py-2">
      <div
        v-for="item in searchEngines"
        :key="item.id"
        class="group flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
      >
        <UIcon :name="item.icon" :size="20" class="shrink-0" />

        <div class="text-sm truncate flex-1">{{ item.name }}</div>

        <UBadge :color="item.is_public ? 'success' : 'neutral'" variant="subtle" size="xs">
          {{ item.is_public ? "公开" : "私有" }}
        </UBadge>

        <div
          class="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0"
          @click.stop
        >
          <UTooltip text="编辑">
            <UButton
              icon="ep:edit"
              size="xs"
              variant="ghost"
              @click="handleOpenSearchEngineFormModal(item)"
            />
          </UTooltip>
          <UTooltip text="删除">
            <UButton
              icon="ep:delete"
              size="xs"
              variant="ghost"
              color="error"
              @click="handleDeleteSearchEngine(item)"
            />
          </UTooltip>
        </div>

        <UChip standalone inset :color="item.status === 1 ? 'success' : 'error'" />
      </div>
      <div v-if="searchEngines.length === 0" class="text-xs text-gray-500 text-center py-4">
        暂无数据，点击上方 + 新增
      </div>
    </div>
  </div>
</template>
