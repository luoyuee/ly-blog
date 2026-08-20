<script setup lang="ts">
import type {
  CalendarOptions,
  EventClickInfo,
  EventDropInfo,
  EventResizeDoneInfo
} from "fullcalendar";
import type { CalendarEvent, CalendarView } from "./types";
import type { PropType } from "vue";
import { Calendar as FullCalendar } from "fullcalendar";
import dayGridPlugin from "fullcalendar/daygrid";
import timeGridPlugin from "fullcalendar/timegrid";
import interactionPlugin from "fullcalendar/interaction";
import listPlugin from "fullcalendar/list";
import classicThemePlugin from "fullcalendar/themes/classic";
import zhCnLocale from "fullcalendar/locales/zh-cn";
import "fullcalendar/skeleton.css";
import "fullcalendar/themes/classic/theme.css";
import "fullcalendar/themes/classic/palette.css";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue";
import CalendarEventFormModal from "./CalendarEventFormModal.vue";
import { expandRecurringEvents } from "./recurrence";

/**
 * 日历组件
 *
 * 基于 FullCalendar v7 封装，支持：
 * - 月/周/日/列表视图切换
 * - 点击日期/拖拽选择时间段新建事件
 * - 点击事件编辑、拖拽/缩放移动事件
 * - 通过 ical-generator 导出 .ics 文件
 *
 * 数据通过 v-model 双向绑定，事件结构使用 ISO 字符串便于持久化。
 * FullCalendar 依赖 DOM，SSR 下无法渲染，使用 ClientOnly 强制客户端渲染。
 */
const model = defineModel<CalendarEvent[]>({ default: () => [] });

const props = defineProps({
  /** 默认视图 */
  defaultView: {
    type: String as PropType<CalendarView>,
    default: "dayGridMonth"
  },
  /** 是否允许新建事件 */
  creatable: {
    type: Boolean,
    default: true
  },
  /** 是否允许编辑事件（拖拽/缩放） */
  editable: {
    type: Boolean,
    default: true
  },
  /** 日历高度 */
  height: {
    type: [String, Number] as PropType<string | number>,
    default: "auto"
  },
  /** 头部工具栏配置，false 时隐藏 */
  headerToolbar: {
    type: [Boolean, Object] as PropType<
      boolean | { left?: string; center?: string; right?: string }
    >,
    default: () => ({
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
    })
  },
  /** 预设事件颜色 */
  eventColor: {
    type: String,
    default: "#3b82f6"
  }
});

const emit = defineEmits<{
  /** 新建事件 */
  create: [event: CalendarEvent];
  /** 更新事件 */
  update: [event: CalendarEvent];
  /** 删除事件 */
  delete: [id: string];
}>();

/** FullCalendar 原生实例与挂载容器 */
const calendarEl = useTemplateRef<HTMLDivElement>("calendarEl");
let calendarInstance: FullCalendar | null = null;

/** 弹窗可见性 */
const formVisible = ref(false);
/** 弹窗模式 */
const formMode = ref<"create" | "edit">("create");
/** 当前编辑的事件记录 */
const formRecord = ref<CalendarEvent | undefined>(undefined);

/** FullCalendar 配置 */
const calendarOptions = computed<CalendarOptions>(() => {
  const headerToolbar = props.headerToolbar === false ? false : props.headerToolbar;

  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, classicThemePlugin],
    initialView: props.defaultView,
    locale: zhCnLocale,
    height: props.height,
    headerToolbar:
      headerToolbar === false
        ? false
        : (headerToolbar as { left?: string; center?: string; right?: string }),
    editable: props.editable,
    selectable: false,
    dayMaxEvents: true,
    weekends: true,
    events: (info, successCallback) => {
      successCallback(expandRecurringEvents(model.value, info.start, info.end, props.eventColor));
    },
    eventColor: props.eventColor,
    // 点击事件
    eventClick: handleEventClick,
    // 拖拽事件
    eventDrop: handleEventDrop,
    // 缩放事件
    eventResize: handleEventResize
  };
});

/** 生成事件 ID */
const generateEventId = (): string => {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/** 从 FullCalendar EventApi 提取 CalendarEvent */
const extractEvent = (fcEvent: {
  id: string;
  title: string;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
  extendedProps?: { description?: string; location?: string };
  backgroundColor?: string;
}): CalendarEvent => {
  return {
    id: fcEvent.id,
    title: fcEvent.title,
    start: fcEvent.start ? fcEvent.start.toISOString() : "",
    end: fcEvent.end ? fcEvent.end.toISOString() : fcEvent.start ? fcEvent.start.toISOString() : "",
    allDay: fcEvent.allDay,
    description: fcEvent.extendedProps?.description,
    location: fcEvent.extendedProps?.location,
    color: fcEvent.backgroundColor
  };
};

/** 点击新增按钮 */
const handleCreate = () => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  openCreateForm({
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false
  });
};

/** 点击事件，周期实例统一编辑原始周期事件 */
const handleEventClick = (info: EventClickInfo) => {
  const seriesId = info.event.extendedProps.seriesId as string | undefined;
  const sourceEvent = model.value.find((event) => event.id === (seriesId ?? info.event.id));
  openEditForm(sourceEvent ?? extractEvent(info.event));
};

/** 拖拽事件后同步数据 */
const handleEventDrop = (info: EventDropInfo) => {
  const updated = extractEvent(info.event);
  const { revert } = info;
  updateEventInModel(updated, revert);
};

/** 缩放事件后同步数据 */
const handleEventResize = (info: EventResizeDoneInfo) => {
  const updated = extractEvent(info.event);
  const { revert } = info;
  updateEventInModel(updated, revert);
};

/** 更新模型中的事件，失败时回滚 */
const updateEventInModel = (updated: CalendarEvent, revert?: () => void) => {
  const index = model.value.findIndex((e) => e.id === updated.id);
  if (index === -1) {
    revert?.();
    return;
  }
  model.value[index] = updated;
  emit("update", updated);
};

/** 打开新建弹窗 */
const openCreateForm = (partial: { start: string; end: string; allDay: boolean }) => {
  formMode.value = "create";
  formRecord.value = {
    id: generateEventId(),
    title: "",
    start: partial.start,
    end: partial.end,
    allDay: partial.allDay
  };
  formVisible.value = true;
};

/** 打开编辑弹窗 */
const openEditForm = (event: CalendarEvent) => {
  formMode.value = "edit";
  formRecord.value = { ...event };
  formVisible.value = true;
};

/** 弹窗提交回调 */
const handleFormSubmit = (event: CalendarEvent) => {
  if (formMode.value === "create") {
    model.value = [...model.value, event];
    emit("create", event);
  } else {
    const index = model.value.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      model.value[index] = event;
      emit("update", event);
    }
  }
  formVisible.value = false;
};

/** 弹窗删除回调 */
const handleFormDelete = (id: string) => {
  model.value = model.value.filter((e) => e.id !== id);
  emit("delete", id);
  formVisible.value = false;
};

/** 挂载 FullCalendar，并在配置或事件数据变化时同步实例 */
onMounted(async () => {
  await nextTick();
  if (!calendarEl.value) return;

  calendarInstance = new FullCalendar(calendarEl.value, toRaw(calendarOptions.value));
  calendarInstance.render();
});

watch(
  calendarOptions,
  (options) => {
    calendarInstance?.resetOptions(toRaw(options));
  },
  { deep: true }
);

watch(
  model,
  () => {
    calendarInstance?.refetchEvents();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  calendarInstance?.destroy();
  calendarInstance = null;
});

/**
 * 导出 iCal 文件
 * @param options 导出选项
 */
const exportICal = async (options?: { name?: string; description?: string; filename?: string }) => {
  const { downloadICalFile } = await import("./utils");
  downloadICalFile(model.value, options);
};

defineExpose({ exportICal });
</script>

<template>
  <ClientOnly>
    <div class="calendar-wrapper">
      <div v-if="creatable" class="mb-4 flex justify-end">
        <UButton color="primary" icon="lucide:plus" label="添加事件" @click="handleCreate" />
      </div>
      <div ref="calendarEl"></div>
      <CalendarEventFormModal
        v-model:open="formVisible"
        :mode="formMode"
        :record="formRecord"
        @submit="handleFormSubmit"
        @delete="handleFormDelete"
      />
    </div>
    <template #fallback>
      <div class="flex items-center justify-center py-20 text-(--text-color-secondary)"
        >日历加载中…</div
      >
    </template>
  </ClientOnly>
</template>

<style scoped>
.calendar-wrapper {
  --fc-classic-button: var(--ui-primary);
  --fc-classic-button-border: var(--ui-primary);
  --fc-classic-button-strong: var(--ui-primary);
  --fc-classic-button-strong-border: var(--ui-primary);
  --fc-classic-button-outline: var(--ui-primary);
  --fc-classic-button-foreground: var(--ui-primary-contrast);
  --fc-classic-primary: var(--ui-primary);
  --fc-classic-primary-foreground: var(--ui-primary-contrast);
  --fc-classic-event: var(--ui-primary);
  --fc-classic-event-contrast: var(--ui-primary-contrast);
  --fc-classic-background: var(--ui-bg);
  --fc-classic-faint: var(--ui-bg-muted);
  --fc-classic-muted: var(--ui-bg-muted);
  --fc-classic-strong: var(--ui-bg-accented);
  --fc-classic-foreground: var(--ui-text);
  --fc-classic-muted-foreground: var(--ui-text-muted);
  --fc-classic-border: var(--ui-border);
  --fc-classic-strong-border: var(--ui-border-accented);
  font-family: inherit;
}

.calendar-wrapper :deep(.fc) {
  font-size: 0.875rem;
}

.calendar-wrapper :deep(.fc-toolbar-title) {
  font-size: 1.125rem;
  font-weight: 600;
}

.calendar-wrapper :deep(.fc-button) {
  text-transform: none;
  border-radius: 0.375rem;
  font-weight: 500;
}

.calendar-wrapper :deep(.fc-button-primary:not(:disabled).fc-button-active) {
  color: var(--ui-primary-fg);
}
</style>
