<script setup lang="ts">
import type { ShortcutItem } from "#shared/types/navigation-website";
import { getShortcutList, deleteShortcut } from "~/apis/navigation-website";
import { useLyEditorModal } from "@ly-editor";

const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();
const { open } = useLyEditorModal("shortcut-form");

const shortcuts = ref<ShortcutItem[]>([]);

const loadShortcuts = async () => {
  try {
    const res = await getShortcutList();
    shortcuts.value = res.data;
  } catch (error) {
    $notify.error({ title: t("message.operate.error"), error });
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
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.simpleMessage", { name: e.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteShortcut(e.id);
        $notify.success({ title: t("message.delete.success") });
        loadShortcuts();
      } catch (error) {
        $notify.error({ title: t("message.operate.error"), error });
      }
    }
  });
};

defineExpose({
  openForm: () => handleOpenShortcutFormModal()
});
</script>
<template>
  <div class="flex-1 min-h-0 overflow-y-auto px-1 py-2">
    <div
      v-for="item in shortcuts"
      :key="item.id"
      class="group flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
    >
      <UIcon :name="item.icon" :size="20" class="shrink-0" />

      <div class="text-sm truncate flex-1">{{ item.name }}</div>

      <UBadge :color="item.is_public ? 'success' : 'neutral'" variant="subtle" size="xs">
        {{
          item.is_public
            ? $t("components.lyEditor.common.status.public")
            : $t("components.lyEditor.common.status.private")
        }}
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
      {{ $t("components.lyEditor.modules.navigation.sectionEmpty") }}
    </div>
  </div>
</template>
