<script setup lang="ts">
import type { WorkItem } from "#shared/types/config";
import { useLyEditorModal } from "@ly-editor";
import { getWorkConfig, updateWorkConfig } from "@/apis/config";
import { SidebarPanel } from "@ly-editor/src/components";
import { VueDraggable } from "vue-draggable-plus";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();

const $notify = useNotification();
const $msgBox = useMessageBox();
const { open } = useLyEditorModal("work-form");

const data = ref<WorkItem[]>([]);
const loading = ref(false);

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await getWorkConfig();
  } catch (error) {
    $notify.error({
      title: t("message.operate.error"),
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const handleOpenFormModal = async (e?: WorkItem) => {
  const result = await open({
    mode: e ? "update" : "create",
    record: e,
    works: data.value
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleDelete = (e: WorkItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        const formData = data.value.filter((item) => item.repoUrl !== e.repoUrl);
        await updateWorkConfig(formData);
        $notify.success({
          title: t("message.delete.success")
        });
        loadData();
      } catch (error) {
        $notify.error({
          title: t("message.operate.error"),
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
      title: t("message.operate.error"),
      error
    });
  }
};

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.work.new"),
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
]);
</script>
<template>
  <SidebarPanel
    :title="$t('components.lyEditor.modules.work.title')"
    :loading="loading"
    :actions="actions"
  >
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
              class="px-3 py-2 bg-(--ly-editor-toolbar-background) hover:bg-gray-100/5 rounded-xs"
            >
              <h6 class="flex items-center justify-between">
                <span class="flex-1 mr-2 truncate">
                  {{ `${item.icon} ${item.name}` }}
                </span>

                <UDropdownMenu
                  :items="[
                    {
                      label: $t('components.lyEditor.modules.work.menu.editInfo'),
                      icon: 'lucide:edit',
                      onSelect: () => {
                        handleOpenFormModal(item);
                      }
                    },
                    {
                      label: $t('components.lyEditor.modules.work.menu.delete'),
                      icon: 'lucide:trash-2',
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
                  <UTooltip :text="$t('components.lyEditor.modules.work.menu.menu')">
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
  </SidebarPanel>
</template>
