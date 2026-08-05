/**
 * 日历组件类型定义
 */

/**
 * 周期频率
 */
export type CalendarRecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/**
 * 周期结束方式
 */
export type CalendarRecurrenceEndType = "never" | "count" | "until";

/**
 * 周期规则
 * @description 按事件开始时间对应的星期、日期或月份重复
 */
export interface CalendarRecurrence {
  /** 重复频率 */
  frequency: CalendarRecurrenceFrequency;
  /** 重复间隔，例如 interval=2 且 frequency=WEEKLY 表示每两周 */
  interval: number;
  /** 结束方式 */
  endType: CalendarRecurrenceEndType;
  /** 重复总次数，包含首次事件 */
  count?: number;
  /** 截止日期，ISO 8601 字符串 */
  until?: string;
}

/**
 * 日历事件数据
 * @description 对外暴露的事件结构，start/end 使用 ISO 字符串，便于序列化与持久化
 */
export interface CalendarEvent {
  /** 事件唯一标识 */
  id: string;
  /** 事件标题 */
  title: string;
  /** 事件描述 */
  description?: string;
  /** 事件地点 */
  location?: string;
  /** 开始时间，ISO 8601 字符串 */
  start: string;
  /** 结束时间，ISO 8601 字符串 */
  end: string;
  /** 是否全天事件 */
  allDay: boolean;
  /** 事件背景色，支持任意合法 CSS 颜色 */
  color?: string;
  /** 周期规则，不传表示单次事件 */
  recurrence?: CalendarRecurrence;
}

/**
 * 日历视图类型
 */
export type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

/**
 * 事件表单弹窗模式
 */
export type CalendarEventFormMode = "create" | "edit";

/**
 * 事件表单弹窗结果
 */
export type CalendarEventFormResult = {
  action: "submitted" | "cancelled";
};

/**
 * iCal 导出选项
 */
export interface CalendarExportOptions {
  /** 日历名称 */
  name?: string;
  /** 日历描述 */
  description?: string;
  /** 生产者标识，遵循 ical-generator 规范 */
  prodId?: string;
  /** 时区，默认 Asia/Shanghai */
  timezone?: string;
  /** 下载文件名 */
  filename?: string;
}
