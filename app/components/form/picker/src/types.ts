// Picker 仅允许基础类型作为最终值，便于和表单、接口参数直接对接。
export type PickerPrimitive = string | number | boolean;

// columns 为多列平铺模式，cascade 为逐级联动模式。
export type PickerMode = "columns" | "cascade";

// 箭头控制与键盘式步进共用方向语义。
export type PickerDirection = "previous" | "next";

// 允许业务数据使用自定义字段名，再统一映射为组件内部结构。
export interface PickerFieldNames {
  label: string;
  value: string;
  children: string;
  disabled: string;
}

// 原始入参保持宽松，真正渲染前会在 utils 中完成收敛与过滤。
export type PickerRawOption = Record<string, unknown>;

export type PickerItems = PickerRawOption[] | PickerRawOption[][];

// Picker 内部只消费这个稳定结构，避免模板层直接处理动态字段名。
export interface PickerNode {
  label: string;
  value: PickerPrimitive;
  disabled: boolean;
  children: PickerNode[];
}

// 箭头模式不渲染完整滚动列表，只需要上一项、当前项、下一项三段预览数据。
export interface PickerColumnDisplayItems {
  previous: PickerNode | null;
  current: PickerNode | null;
  next: PickerNode | null;
}

export type PickerColumn = PickerNode[];

// 每一列的值都允许暂时为空，便于在归一化和级联回填过程中逐步补全。
export type PickerSelectionState = Array<PickerPrimitive | undefined>;

// Scrollbar 组件暴露给 Picker 的最小控制面，只保留滚动定位和读取原生滚动容器能力。
export interface PickerScrollbarExposed {
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => void;
  getScrollElement: () => HTMLElement | null | undefined;
}

// 单列的交互状态目前只记录滚动条拖拽，用于暂停自动吸附。
export interface PickerColumnInteractionState {
  isDraggingScrollbar: boolean;
}

// 面板和触发器都需要“当前列 + 当前选中值”的组合态，因此抽成稳定结构复用。
export interface PickerDisplayState {
  selection: PickerSelectionState;
  columns: PickerColumn[];
}
