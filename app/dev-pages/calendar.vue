<script setup lang="ts">
import type { CalendarEvent } from "@/components/calendar";
import { Calendar } from "@/components/calendar";
import dayjs from "dayjs";

/**
 * 日历组件测试页
 * 用于验证基于 FullCalendar 的日历组件，支持增删改事件、拖拽/缩放调整、ical 导出
 */
const events = ref<CalendarEvent[]>([
  {
    id: "evt-1",
    title: "团队周会",
    description: "讨论本周工作进展与下周计划",
    location: "会议室 A",
    start: dayjs().day(1).hour(10).minute(0).second(0).toISOString(),
    end: dayjs().day(1).hour(11).minute(0).second(0).toISOString(),
    allDay: false,
    color: "#3b82f6"
  },
  {
    id: "evt-2",
    title: "代码评审",
    description: "Review PR #123",
    start: dayjs().day(3).hour(14).minute(30).second(0).toISOString(),
    end: dayjs().day(3).hour(15).minute(30).second(0).toISOString(),
    allDay: false,
    color: "#22c55e"
  },
  {
    id: "evt-3",
    title: "全天外出",
    start: dayjs().day(5).startOf("day").toISOString(),
    end: dayjs().day(5).endOf("day").toISOString(),
    allDay: true,
    color: "#f97316"
  }
]);

const calendarRef = ref<{
  exportICal: (options?: {
    name?: string;
    description?: string;
    filename?: string;
  }) => Promise<void>;
} | null>(null);

const handleExport = () => {
  calendarRef.value?.exportICal({
    name: "我的日程",
    description: "由日历组件导出",
    filename: "my-calendar.ics"
  });
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Calendar 日历组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        基于 FullCalendar
        封装的日历组件，支持月/周/日/列表视图切换，点击日期或拖拽选区新建事件，点击事件编辑，拖拽与缩放调整时间，并可导出
        .ics 日程文件。
      </p>
    </section>

    <section class="mx-auto max-w-240">
      <div class="mb-4 flex items-center justify-end gap-2">
        <UButton
          color="primary"
          variant="outline"
          icon="lucide:download"
          label="导出 .ics"
          @click="handleExport"
        />
      </div>

      <Calendar ref="calendarRef" v-model="events" />
    </section>
  </main>
</template>
