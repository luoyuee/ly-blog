<script setup lang="ts">
import type { EditorTabItem } from "#shared/types/ly-editor";
import type { CalendarEvent } from "@/components/calendar";
import type { PropType } from "vue";
import { Calendar } from "@/components/calendar";
import { useLogger } from "@/composables/useLogger";

const logger = useLogger();
const $notify = useNotification();

const props = defineProps({
  tab: {
    type: Object as PropType<EditorTabItem & { type: "calendar-panel" }>,
    required: true,
    validator: (value: EditorTabItem) => value.type === "calendar-panel"
  }
});

const events = ref<CalendarEvent[]>([]);
const loading = ref(false);
const saving = ref(false);

const calendarRef = useTemplateRef("calendarRef");

/**
 * 加载日历事件数据。
 * @description 暂未接入接口，事件列表初始化为空；后续接入接口后在此拉取对应日历的事件数据。
 */
const loadData = async () => {
  try {
    loading.value = true;
    events.value = [];
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "加载日历失败",
      error
    });
  } finally {
    loading.value = false;
  }
};

/** 保存日历数据到后端 */
const handleSave = async () => {
  try {
    saving.value = true;
    // 暂未接入接口，保存仅作占位，后续在此调用更新接口
    $notify.success({
      title: "保存成功"
    });
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "保存失败",
      error
    });
  } finally {
    saving.value = false;
  }
};

/** 导出当前日历为 .ics 文件 */
const handleExport = async () => {
  try {
    await calendarRef.value?.exportICal({
      name: props.tab.label,
      filename: `${props.tab.label}.ics`
    });
  } catch (error) {
    logger.error(error);
    $notify.error({
      title: "导出失败",
      error
    });
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 border-b border-white/10">
      <h3 class="text-sm font-medium truncate">{{ props.tab.label }}</h3>
      <div class="flex gap-2">
        <UButton
          icon="lucide:download"
          size="sm"
          variant="soft"
          :disabled="loading || events.length === 0"
          @click="handleExport"
        >
          导出 iCal
        </UButton>
        <UButton
          icon="lucide:save"
          size="sm"
          :loading="saving"
          :disabled="loading"
          @click="handleSave"
        >
          保存
        </UButton>
      </div>
    </div>
    <div class="flex-1 overflow-auto p-4">
      <Calendar ref="calendarRef" v-model="events" />
    </div>
  </div>
</template>
