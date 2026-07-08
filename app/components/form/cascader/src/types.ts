// Cascader 仅允许基础类型作为输出值，便于直接参与表单提交和接口参数传递。
export type CascaderPrimitive = string | number | boolean;

// 允许业务方用自定义字段名描述级联数据结构。
export interface CascaderFieldNames {
  label: string;
  value: string;
  children: string;
  disabled: string;
  leaf: string;
}

// 原始节点保持宽松结构，归一化后再进入组件内部逻辑。
export type CascaderRawOption = Record<string, unknown>;

export type CascaderItems = CascaderRawOption[];

// 组件内部统一消费稳定节点结构，避免模板层处理动态字段名。
export interface CascaderNode {
  label: string;
  value: CascaderPrimitive;
  disabled: boolean;
  leaf: boolean;
  children: CascaderNode[];
}

// 当前展示列中的节点列表。
export type CascaderColumn = CascaderNode[];

// 级联路径中允许暂时为空，便于按列展开和逐级修正。
export type CascaderSelectionState = Array<CascaderPrimitive | undefined>;

// 面板和触发器都要复用“当前列 + 当前选中路径”的展示态。
export interface CascaderDisplayState {
  selection: CascaderSelectionState;
  columns: CascaderColumn[];
  selectedNodes: CascaderNode[];
}
