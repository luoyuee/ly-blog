import ical, { ICalEventRepeatingFreq } from "ical-generator";
import type { CalendarEvent, CalendarExportOptions } from "./types";

/**
 * 将事件列表导出为 iCal 字符串
 * @param events 事件列表
 * @param options 导出选项
 * @returns iCal 格式字符串
 */
export const exportToICalString = (
  events: CalendarEvent[],
  options: CalendarExportOptions = {}
): string => {
  const { name = "我的日程", description, prodId, timezone = "Asia/Shanghai" } = options;

  const calendar = ical({
    name,
    ...(description ? { description } : {}),
    ...(prodId ? { prodId } : {}),
    timezone
  });

  events.forEach((event) => {
    calendar.createEvent({
      id: event.id,
      summary: event.title,
      ...(event.description ? { description: event.description } : {}),
      ...(event.location ? { location: event.location } : {}),
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay,
      timezone,
      ...(event.recurrence
        ? {
            repeating: {
              freq: ICalEventRepeatingFreq[event.recurrence.frequency],
              interval: event.recurrence.interval,
              ...(event.recurrence.endType === "count" && event.recurrence.count
                ? { count: event.recurrence.count }
                : {}),
              ...(event.recurrence.endType === "until" && event.recurrence.until
                ? { until: new Date(event.recurrence.until) }
                : {})
            }
          }
        : {})
    });
  });

  return calendar.toString();
};

/**
 * 下载 iCal 文件
 * @param events 事件列表
 * @param options 导出选项
 */
export const downloadICalFile = (
  events: CalendarEvent[],
  options: CalendarExportOptions = {}
): void => {
  const { filename = "calendar.ics" } = options;
  const icsContent = exportToICalString(events, options);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
