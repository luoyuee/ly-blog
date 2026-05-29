import type { CalendarDateTime, Time, ZonedDateTime } from "@internationalized/date";

export type TimePickerInputValue =
  | string
  | Time
  | CalendarDateTime
  | ZonedDateTime
  | null;

export type TimePickerValue = string | Time | null;

export type TimePickerRangeInputValue = {
  start: TimePickerInputValue;
  end: TimePickerInputValue;
} | null;

export type TimePickerRangeValue = {
  start: TimePickerValue;
  end: TimePickerValue;
} | null;

export type TimePickerValueType = "string" | "time";

export type TimePickerHourCycle = 12 | 24;

export type TimePickerColumnMode = "hour" | "minute" | "second" | "period";

export type TimePickerPeriod = "AM" | "PM";
