<script setup lang="ts">
import type { CalendarItem } from "#shared/types/ly-editor";
import { SidebarPanel, SidebarPanelListItem } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import Scrollbar from "@/components/scrollbar";

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
      title: "加载日历列表失败",
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
    label: "日历管理",
    type: LyEditorTabPanelEnum.CalendarPanel
  });
};

/** 删除日历 */
const handleDelete = (e: CalendarItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.title}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        // 暂未接入接口，仅作本地删除占位
        allData.value = allData.value.filter((item) => item.id !== e.id);
        $notify.success({
          title: "删除成功"
        });
      } catch (error) {
        $notify.error({
          title: "删除失败",
          error
        });
      }
    }
  });
};

const actions = [
  {
    label: "新建日历",
    icon: "lucide:plus",
    onClick: () => {
      handleOpenFormModal();
    }
  }
];
</script>
<template>
  <SidebarPanel title="日历管理" :loading="loading" :actions="actions">
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="px-2 py-2">
        <UInput
          v-model.trim="keyword"
          icon="lucide:search"
          class="w-full"
          placeholder="搜索日历标题或描述"
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
            :action-items="[
              {
                label: '编辑信息',
                icon: 'lucide:edit',
                onSelect: () => {
                  handleOpenFormModal(item);
                }
              },
              {
                label: '删除日历',
                icon: 'lucide:trash-2',
                color: 'error',
                onSelect: () => {
                  handleDelete(item);
                }
              }
            ]"
            @click="handleOpenCalendar"
          />
        </Scrollbar>
      </div>
    </div>
  </SidebarPanel>
</template>
