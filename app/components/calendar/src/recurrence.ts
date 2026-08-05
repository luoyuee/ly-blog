import type { CalendarEvent, CalendarRecurrenceFrequency } from "./types";
import dayjs from "dayjs";

const frequencyUnitMap: Record<CalendarRecurrenceFrequency, "day" | "week" | "month" | "year"> = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  YEARLY: "year"
};

/**
 * 将周期事件展开为指定时间范围内的 FullCalendar 事件实例
 * @param events 原始事件列表
 * @param rangeStart 可见范围开始时间
 * @param rangeEnd 可见范围结束时间
 */
export const expandRecurringEvents = (
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  defaultColor: string
) => {
  return events.flatMap((event) => {
    const createEventInput = (start: Date, end: Date, occurrenceId: string) => ({
      id: occurrenceId,
      groupId: event.id,
      title: event.title,
      start,
      end,
      allDay: event.allDay,
      editable: !event.recurrence,
      backgroundColor: event.color ?? defaultColor,
      borderColor: event.color ?? defaultColor,
      extendedProps: {
        seriesId: event.id,
        description: event.description,
        location: event.location,
        recurrence: event.recurrence
      }
    });

    if (!event.recurrence) {
      return [createEventInput(new Date(event.start), new Date(event.end), event.id)];
    }

    const recurrence = event.recurrence;
    const originalStart = dayjs(event.start);
    const duration = dayjs(event.end).diff(originalStart, "millisecond");
    const unit = frequencyUnitMap[recurrence.frequency];
    const rangeStartValue = dayjs(rangeStart);
    const approximateIndex = Math.max(
      0,
      Math.floor(rangeStartValue.diff(originalStart, unit, true) / recurrence.interval) - 1
    );
    const occurrences = [];
    let index = approximateIndex;

    while (true) {
      if (recurrence.endType === "count" && index >= (recurrence.count ?? 1)) break;

      const occurrenceStart = originalStart.add(index * recurrence.interval, unit);
      if (recurrence.endType === "until" && occurrenceStart.isAfter(recurrence.until)) break;
      if (!occurrenceStart.isBefore(rangeEnd)) break;

      const occurrenceEnd = occurrenceStart.add(duration, "millisecond");
      if (occurrenceEnd.isAfter(rangeStart)) {
        occurrences.push(
          createEventInput(
            occurrenceStart.toDate(),
            occurrenceEnd.toDate(),
            `${event.id}::${occurrenceStart.valueOf()}`
          )
        );
      }

      index += 1;
    }

    return occurrences;
  });
};
