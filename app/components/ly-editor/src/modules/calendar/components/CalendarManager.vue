<script setup lang="ts">
import type { CalendarItem } from "#shared/types/ly-editor";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import Scrollbar from "@/components/scrollbar";

const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();
const { openTabPanel } = useLyEditorTabs();
const { open } = useLyEditorModal("calendar-form");

const allData = ref<CalendarItem[]>([]);
const loading = ref(false);
const keyword = ref("");

/** 按关键字过滤日历列表 */
const data = computed<CalendarItem[]>(() => {
  if (!keyword.value) return allData.value;
  const kw = keyword.value.toLowerCase();
  return allData.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(kw) ||
      (item.description?.toLowerCase().includes(kw) ?? false)
    );
  });
});

/**
 * 加载日历列表。
 * @description 暂未接入接口，列表保持为空；后续接入 `@/apis/calendar` 后在此拉取数据。
 */
const loadData = async (): Promise<void> => {
  try {
    loading.value = true;
    allData.value = [];
  } catch (error) {
    $notify.error({
      title: t("components.lyEditor.modules.calendar.loadFailed"),
      error
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

/** 新建或编辑日历信息 */
const handleOpenFormModal = async (record?: CalendarItem) => {
  const result = await open({
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

/** 点击列表项，打开唯一的日历选项卡 */
const handleOpenCalendar = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.CalendarPanel,
    label: t("components.lyEditor.modules.calendar.title"),
    type: LyEditorTabPanelEnum.CalendarPanel
  });
};

/** 删除日历 */
const handleDelete = (e: CalendarItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.title }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        // 暂未接入接口，仅作本地删除占位
        allData.value = allData.value.filter((item) => item.id !== e.id);
        $notify.success({
          title: t("message.delete.success")
        });
      } catch (error) {
        $notify.error({
          title: t("message.delete.error"),
          error
        });
      }
    }
  });
};

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.calendar.new"),
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
]);

/**
 * 列表项操作菜单，按当前日历动态生成。
 */
const getActionItems = (item: CalendarItem) => [
  {
    label: t("components.lyEditor.modules.calendar.menu.editInfo"),
    icon: "lucide:edit",
    onSelect: () => {
      handleOpenFormModal(item);
    }
  },
  {
    label: t("components.lyEditor.modules.calendar.menu.delete"),
    icon: "lucide:trash-2",
    color: "error",
    onSelect: () => {
      handleDelete(item);
    }
  }
];
</script>
<template>
  <SidebarPanel
    :title="t('components.lyEditor.modules.calendar.title')"
    :loading="loading"
    :actions="actions"
  >
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="px-2 py-2">
        <UInput
          v-model.trim="keyword"
          icon="lucide:search"
          class="w-full"
          :placeholder="t('components.lyEditor.modules.calendar.searchPlaceholder')"
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <Scrollbar class="h-full">
          <SidebarPanelListItem
            v-for="item in data"
            :key="item.id"
            :icon="item.color ? '' : 'lucide:calendar'"
            :title="item.title"
            :description="item.description ?? undefined"
            :meta-items="[{ text: item.id, icon: 'lucide:hash' }]"
            :action-items="getActionItems(item)"
            @click="handleOpenCalendar"
          />
        </Scrollbar>
      </div>
    </div>
  </SidebarPanel>
</template>
