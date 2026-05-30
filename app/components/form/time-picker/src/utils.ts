import type { PickerPrimitive, PickerRawOption } from "@/components/form/picker";
import type {
  TimePickerColumnMode,
  TimePickerHourCycle,
  TimePickerInputValue,
  TimePickerPeriod,
  TimePickerValueType
} from "./types";
import { Time } from "@internationalized/date";
import dayjs from "dayjs";

const TIME_PICKER_DATE = "2000-01-01";

const padTimeUnit = (value: number) => {
  return String(value).padStart(2, "0");
};

export const normalizeTimeStep = (step: number) => {
  if (!Number.isInteger(step) || step <= 0 || step > 59) {
    return 1;
  }

  return step;
};

export const createTimePickerColumn = (
  max: number,
  step: number,
  getLabel: (value: number) => string = padTimeUnit
): PickerRawOption[] => {
  const normalizedStep = normalizeTimeStep(step);
  const items: PickerRawOption[] = [];

  for (let value = 0; value <= max; value += normalizedStep) {
    items.push({
      label: getLabel(value),
      value
    });
  }

  return items;
};

export const createHourColumn = (hourCycle: TimePickerHourCycle) => {
  if (hourCycle === 12) {
    return Array.from({ length: 12 }, (_, index) => {
      const value = index + 1;
      return {
        label: padTimeUnit(value),
        value
      };
    });
  }

  return createTimePickerColumn(23, 1);
};

export const createPeriodColumn = (): PickerRawOption[] => {
  return [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" }
  ];
};

export const getTimePickerColumnModes = (
  hourCycle: TimePickerHourCycle,
  showSecond: boolean
): TimePickerColumnMode[] => {
  const modes: TimePickerColumnMode[] = ["hour", "minute"];

  if (showSecond) {
    modes.push("second");
  }

  if (hourCycle === 12) {
    modes.push("period");
  }

  return modes;
};

export const getPeriodByHour = (hour: number): TimePickerPeriod => {
  return hour >= 12 ? "PM" : "AM";
};

export const getDisplayHourByTime = (time: Time, hourCycle: TimePickerHourCycle) => {
  if (hourCycle === 24) {
    return time.hour;
  }

  const hour = time.hour % 12;
  return hour === 0 ? 12 : hour;
};

export const createTimeFromSelection = (
  selection: PickerPrimitive[],
  columnModes: TimePickerColumnMode[],
  hourCycle: TimePickerHourCycle
): Time | null => {
  const hourValue = selection[columnModes.indexOf("hour")];
  const minuteValue = selection[columnModes.indexOf("minute")];
  const secondIndex = columnModes.indexOf("second");
  const periodIndex = columnModes.indexOf("period");

  if (typeof hourValue !== "number" || typeof minuteValue !== "number") {
    return null;
  }

  const secondValue = secondIndex >= 0 ? selection[secondIndex] : 0;
  const second = typeof secondValue === "number" ? secondValue : 0;
  let hour = hourValue;

  if (hourCycle === 12) {
    const periodValue = selection[periodIndex];
    const period: TimePickerPeriod = periodValue === "PM" ? "PM" : "AM";
    hour = hourValue % 12;

    if (period === "PM") {
      hour += 12;
    }
  }

  return new Time(hour, minuteValue, second);
};

export const createSelectionFromTime = (
  time: Time | null,
  columnModes: TimePickerColumnMode[],
  hourCycle: TimePickerHourCycle
): PickerPrimitive[] => {
  if (!time) {
    return [];
  }

  return columnModes.map((mode) => {
    if (mode === "hour") {
      return getDisplayHourByTime(time, hourCycle);
    }

    if (mode === "minute") {
      return time.minute;
    }

    if (mode === "second") {
      return time.second;
    }

    return getPeriodByHour(time.hour);
  });
};

export const parseStringToTime = (value: string, format: string) => {
  const parsedValue = dayjs(`${TIME_PICKER_DATE} ${value}`, `YYYY-MM-DD ${format}`);

  if (!parsedValue.isValid()) {
    return null;
  }

  return new Time(parsedValue.hour(), parsedValue.minute(), parsedValue.second());
};

export const parseTimePickerValue = (
  value: TimePickerInputValue | undefined,
  format: string
): Time | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return parseStringToTime(value, format);
  }

  return new Time(value.hour, value.minute, value.second);
};

export const formatTimePickerValue = (
  time: Time | null,
  valueType: TimePickerValueType,
  format: string
) => {
  if (!time) {
    return null;
  }

  if (valueType === "time") {
    return time;
  }

  return dayjs({
    year: 2000,
    month: 0,
    day: 1,
    hour: time.hour,
    minute: time.minute,
    second: time.second
  }).format(format);
};

export const formatTimePickerDisplay = (time: Time | null, format: string, placeholder: string) => {
  const displayText = formatTimePickerValue(time, "string", format);
  return displayText ?? placeholder;
};
