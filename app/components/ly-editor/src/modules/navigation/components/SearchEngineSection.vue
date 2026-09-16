<script setup lang="ts">
import type { SearchEngineItem } from "#shared/types/navigation-website";
import { getSearchEngineList, deleteSearchEngine } from "~/apis/navigation-website";
import { useLyEditorModal } from "@ly-editor";

const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();
const { open } = useLyEditorModal("search-engine-form");

const searchEngines = ref<SearchEngineItem[]>([]);

const loadSearchEngines = async () => {
  try {
    const res = await getSearchEngineList();
    searchEngines.value = res.data;
  } catch (error) {
    $notify.error({ title: t("message.operate.error"), error });
  }
};

onMounted(() => {
  loadSearchEngines();
});

const handleOpenSearchEngineFormModal = async (e?: SearchEngineItem) => {
  const result = await open({ record: e });

  if (result.action === "submitted") {
    await loadSearchEngines();
  }
};

const handleDeleteSearchEngine = (e: SearchEngineItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.simpleMessage", { name: e.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteSearchEngine(e.id);
        $notify.success({ title: t("message.delete.success") });
        loadSearchEngines();
      } catch (error) {
        $notify.error({ title: t("message.operate.error"), error });
      }
    }
  });
};

defineExpose({
  openForm: () => handleOpenSearchEngineFormModal()
});
</script>
<template>
  <div class="flex-1 min-h-0 overflow-y-auto px-1 py-2">
    <div
      v-for="item in searchEngines"
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
        class="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0"
        @click.stop
      >
        <UTooltip :text="$t('common.edit')">
          <UButton
            icon="lucide:edit"
            size="xs"
            variant="ghost"
            @click="handleOpenSearchEngineFormModal(item)"
          />
        </UTooltip>
        <UTooltip :text="$t('common.delete')">
          <UButton
            icon="lucide:trash-2"
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
      {{ $t("components.lyEditor.modules.navigation.sectionEmpty") }}
    </div>
  </div>
</template>
