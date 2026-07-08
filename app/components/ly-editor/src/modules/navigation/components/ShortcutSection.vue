<script setup lang="ts">
import type { ShortcutItem } from "#shared/types/navigation-website";
import { getShortcutList, deleteShortcut } from "~/apis/navigation-website";
import { useLyEditorModal } from "@ly-editor";

const $notify = useNotification();
const $msgBox = useMessageBox();
const { open } = useLyEditorModal("shortcut-form");

const shortcuts = ref<ShortcutItem[]>([]);

const loadShortcuts = async () => {
  try {
    const res = await getShortcutList();
    shortcuts.value = res.data;
  } catch (error) {
    $notify.error({ title: "操作失败", error });
  }
};

onMounted(() => {
  loadShortcuts();
});

const handleOpenShortcutFormModal = async (e?: ShortcutItem) => {
  const result = await open({ record: e });

  if (result.action === "submitted") {
    await loadShortcuts();
  }
};

const handleDeleteShortcut = (e: ShortcutItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除快捷方式「${e.name}」，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteShortcut(e.id);
        $notify.success({ title: "删除成功" });
        loadShortcuts();
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
      <span class="text-xs font-medium text-gray-400">快捷方式</span>
      <UTooltip text="新增快捷方式">
        <UButton
          size="xs"
          icon="lucide:plus"
          color="neutral"
          variant="ghost"
          @click="handleOpenShortcutFormModal()"
        />
      </UTooltip>
    </div>
    <div class="flex-1 overflow-y-auto px-1 py-2">
      <div
        v-for="item in shortcuts"
        :key="item.id"
        class="group flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
      >
        <UIcon :name="item.icon" :size="20" class="shrink-0" />

        <div class="text-sm truncate flex-1">{{ item.name }}</div>

        <UBadge :color="item.is_public ? 'success' : 'neutral'" variant="subtle" size="xs">
          {{ item.is_public ? "公开" : "私有" }}
        </UBadge>

        <div
          class="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0"
          @click.stop
        >
          <UButton
            icon="lucide:edit"
            size="xs"
            variant="ghost"
            @click="handleOpenShortcutFormModal(item)"
          />
          <UButton
            icon="lucide:trash-2"
            size="xs"
            variant="ghost"
            color="error"
            @click="handleDeleteShortcut(item)"
          />
        </div>

        <UChip standalone inset :color="item.status === 1 ? 'success' : 'error'" />
      </div>
      <div v-if="shortcuts.length === 0" class="text-xs text-gray-500 text-center py-4">
        暂无数据，点击上方 + 新增
      </div>
    </div>
  </div>
</template>
