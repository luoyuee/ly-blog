// DatePicker 对外只暴露字符串、Date 或空值，便于直接对接表单字段与接口参数。
export type DatePickerValue = Date | string | null;

// valueType 决定确认选择后写回 v-model 的实际数据类型。
export type DatePickerValueType = "string" | "date";

// date 只展示日期，datetime 同时展示并提交时分秒。
export type DatePickerMode = "date" | "datetime";

// 展示格式和提交格式分离，避免仅为 UI 文案改变接口字段格式。
export interface DatePickerShowFormat {
  date: string;
  time: string;
}

export interface DatePickerRangeValue {
  start: DatePickerValue;
  end: DatePickerValue;
}
