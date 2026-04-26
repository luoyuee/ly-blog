<script setup lang="ts">
import type { ShortcutItem } from "#shared/types/navigation-website";
import { getShortcutList, deleteShortcut } from "~/apis/navigation-website";
import { lyEditorEmitter } from "~/events";

const $notify = useNotification();
const $msgBox = useMessageBox();

/** 快捷方式列表 */
const shortcuts = ref<ShortcutItem[]>([]);

/** 加载快捷方式数据 */
const loadShortcuts = async () => {
  try {
    const res = await getShortcutList();
    shortcuts.value = res.data;
  } catch (error) {
    $notify.error({ title: "操作失败", error });
  }
};

lyEditorEmitter.on("notify.shortcut-form:submitted", loadShortcuts);

onMounted(() => {
  loadShortcuts();
});

/** 打开快捷方式表单 */
const handleOpenShortcutFormModal = (e?: ShortcutItem) => {
  lyEditorEmitter.emit("cmd.modal-manager:open:shortcut-form", e);
};

/** 删除快捷方式 */
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
            icon="ep:edit"
            size="xs"
            variant="ghost"
            @click="handleOpenShortcutFormModal(item)"
          />
          <UButton
            icon="ep:delete"
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
