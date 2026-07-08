import type { DateRange, TimeValue } from "reka-ui";
import type { DateValue } from "@internationalized/date";
import type { DatePickerValue, DatePickerValueType } from "./types";
import { CalendarDateTime, Time } from "@internationalized/date";
import dayjs from "dayjs";

export const parsePickerModelValue = (value: DatePickerValue | undefined, format: string) => {
  if (typeof value === "string") {
    return dayjs(value, format);
  }

  if (value instanceof Date) {
    return dayjs(value);
  }

  return null;
};

export const createCalendarDateTime = (value: dayjs.Dayjs) => {
  return new CalendarDateTime(
    value.year(),
    value.month() + 1,
    value.date(),
    value.hour(),
    value.minute(),
    value.second()
  );
};

// CalendarDateTime 为不可变值对象，复制后再回填可以避免取消操作影响上一次选择。
export const cloneCalendarDateTime = (value: CalendarDateTime) => {
  return new CalendarDateTime(
    value.year,
    value.month,
    value.day,
    value.hour,
    value.minute,
    value.second
  );
};

export const createTimeValue = (value: dayjs.Dayjs) => {
  return new Time(value.hour(), value.minute(), value.second());
};

export const createDayjsFromCalendarValue = (
  dateValue: DateValue | null,
  timeValue: TimeValue | null
) => {
  if (!dateValue) {
    return null;
  }

  return dayjs({
    year: dateValue.year,
    month: dateValue.month - 1,
    day: dateValue.day,
    hour: timeValue?.hour || 0,
    minute: timeValue?.minute || 0,
    second: timeValue?.second || 0
  });
};

export const formatDatePickerValue = (
  value: dayjs.Dayjs,
  valueType: DatePickerValueType,
  format: string
) => {
  if (valueType === "date") {
    return value.toDate();
  }

  return value.format(format);
};

export const formatDateRangePickerValue = (
  value: {
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  },
  valueType: DatePickerValueType,
  format: string
) => {
  return {
    start: formatDatePickerValue(value.start, valueType, format),
    end: formatDatePickerValue(value.end, valueType, format)
  };
};

// 将外部 v-model 收敛为 UCalendar 与 TimePicker 能直接消费的内部值。
export const syncSinglePickerValue = (
  value: dayjs.Dayjs | null,
  setDateValue: (value: CalendarDateTime | null) => void,
  setTimeValue: (value: TimeValue | null) => void
) => {
  if (!value?.isValid()) {
    setDateValue(null);
    setTimeValue(null);
    return;
  }

  setDateValue(createCalendarDateTime(value));
  setTimeValue(createTimeValue(value));
};

export const createDayjsRangeFromValue = (
  rangeValue: DateRange | null,
  startTimeValue: TimeValue | null,
  endTimeValue: TimeValue | null
) => {
  if (!rangeValue?.start || !rangeValue?.end) {
    return null;
  }

  return {
    start: createDayjsFromCalendarValue(rangeValue.start, startTimeValue),
    end: createDayjsFromCalendarValue(rangeValue.end, endTimeValue)
  };
};

// 范围选择需要同时保证开始、结束都有效，否则整个范围视为未选择。
export const syncRangePickerValue = (
  startValue: dayjs.Dayjs | null,
  endValue: dayjs.Dayjs | null,
  setRangeValue: (value: DateRange | null) => void,
  setStartTimeValue: (value: TimeValue | null) => void,
  setEndTimeValue: (value: TimeValue | null) => void
) => {
  if (!startValue?.isValid() || !endValue?.isValid()) {
    setRangeValue(null);
    setStartTimeValue(null);
    setEndTimeValue(null);
    return;
  }

  setRangeValue({
    start: createCalendarDateTime(startValue),
    end: createCalendarDateTime(endValue)
  });
  setStartTimeValue(createTimeValue(startValue));
  setEndTimeValue(createTimeValue(endValue));
};
