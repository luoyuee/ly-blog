/**
 * 树节点接口定义
 */
export interface ITreeNode {
  label?: string;
  value?: string | number;
  icon?: string;
  children?: ITreeNode[];
  disabled?: boolean;
  // eslint-disable-next-line
  [key: string]: any;
}

/**
 * 树选择器配置选项
 */
export interface TreeSelectOptions {
  placeholder?: string;
  searchable?: boolean;
  labelKey?: string;
  valueKey?: string;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}

/**
 * 单选或多选值的类型
 */
export type TreeSelectValue = string | number | null | (string | number)[];

/**
 * 半选状态的类型
 */
export type IndeterminateState = Set<string | number>;
