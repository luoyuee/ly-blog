// 统一从目录入口暴露 Cascader 组件与类型，避免外部直接依赖内部实现文件路径。
import Cascader from "./src/Cascader.vue";
import CascaderPanel from "./src/CascaderPanel.vue";

export type {
  CascaderColumn,
  CascaderDisplayState,
  CascaderFieldNames,
  CascaderItems,
  CascaderNode,
  CascaderPrimitive,
  CascaderRawOption,
  CascaderSelectionState
} from "./src/types";

export { Cascader, CascaderPanel };
