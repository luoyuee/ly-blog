import type {
  PickerColumn,
  PickerColumnDisplayItems,
  PickerDirection,
  PickerDisplayState,
  PickerFieldNames,
  PickerItems,
  PickerMode,
  PickerNode,
  PickerPrimitive,
  PickerRawOption,
  PickerSelectionState
} from "./types";

const isPrimitive = (value: unknown): value is PickerPrimitive => {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
};

const isRecord = (value: unknown): value is PickerRawOption => {
  return typeof value === "object" && value !== null;
};

// items 同时支持“多列数组”和“级联树”两种形态。
// 组件层不直接判断数组结构，统一经由这里拆出 columns/options，避免 Picker 与 PickerPanel 重复实现。
export const isPickerColumnItems = (
  items: PickerItems
): items is PickerRawOption[][] => {
  return items.every(Array.isArray);
};

export const getPickerColumnItems = (items: PickerItems) => {
  if (isPickerColumnItems(items)) {
    return items;
  }

  return [];
};

// 只有级联模式消费 options；多列模式传入二维数组时这里返回空数组，避免后续误把列数组当树解析。
export const getPickerOptionItems = (items: PickerItems) => {
  if (isPickerColumnItems(items)) {
    return [];
  }

  return items;
};

const normalizeColumn = (
  options: PickerRawOption[],
  fieldNames: PickerFieldNames
): PickerColumn => {
  return options
    .filter(isRecord)
    .map((item) => normalizeNode(item, fieldNames))
    .filter((item): item is PickerNode => item !== null);
};

// 递归把任意业务数据收敛为 PickerNode。
// 不满足 label/value 基本要求的数据会直接丢弃，避免把不完整节点带入渲染和选择逻辑。
const normalizeNode = (
  option: PickerRawOption,
  fieldNames: PickerFieldNames
): PickerNode | null => {
  const labelValue = option[fieldNames.label];
  const rawValue = option[fieldNames.value];
  const childrenValue = option[fieldNames.children];

  if (typeof labelValue !== "string" || !isPrimitive(rawValue)) {
    return null;
  }

  const children = Array.isArray(childrenValue)
    ? childrenValue
        .filter(isRecord)
        .map((item) => normalizeNode(item, fieldNames))
        .filter((item): item is PickerNode => item !== null)
    : [];

  return {
    label: labelValue,
    value: rawValue,
    disabled: Boolean(option[fieldNames.disabled]),
    children
  };
};

// 多列模式下每列互不影响，只需要逐列归一化。
export const normalizePickerColumns = (
  columns: PickerRawOption[][],
  fieldNames: PickerFieldNames
): PickerColumn[] => {
  return columns.map((column) => normalizeColumn(column, fieldNames));
};

// 级联模式的根节点仍然按一列结构处理，后续列由 children 逐级展开。
export const normalizePickerOptions = (
  options: PickerRawOption[],
  fieldNames: PickerFieldNames
): PickerColumn => {
  return normalizeColumn(options, fieldNames);
};

// 只有“值匹配且未禁用”的节点才允许作为当前选中项。
export const findOptionByValue = (
  options: PickerColumn,
  value: PickerPrimitive | undefined
): PickerNode | null => {
  if (value === undefined) {
    return null;
  }

  return options.find((item) => item.value === value && !item.disabled) ?? null;
};

// 当外部值缺失、失效或指向禁用项时，统一回退到第一项可选值。
export const findFirstSelectable = (options: PickerColumn): PickerNode | null => {
  return options.find((item) => !item.disabled) ?? null;
};

// 多列模式独立修正每一列：优先保留当前值，保不住时才回退到首个可选项。
export const resolveColumnsSelection = (
  sourceSelection: PickerSelectionState,
  columns: PickerColumn[]
): PickerSelectionState => {
  return columns.map((column, index) => {
    const selected = findOptionByValue(column, sourceSelection[index]);
    return selected?.value ?? findFirstSelectable(column)?.value;
  });
};

// 级联模式需要沿着当前路径逐层向下解析。
// 一旦某层值无效，就从该层首个可选项重新建立后续路径。
export const resolveCascadeSelection = (
  sourceSelection: PickerSelectionState,
  options: PickerColumn
): PickerSelectionState => {
  const selection: PickerSelectionState = [];
  let currentOptions = options;
  let depth = 0;

  while (currentOptions.length > 0) {
    const currentSelected = findOptionByValue(currentOptions, sourceSelection[depth]);
    const selected = currentSelected ?? findFirstSelectable(currentOptions);

    selection.push(selected?.value);

    if (!selected) {
      break;
    }

    currentOptions = selected.children;
    depth += 1;

    if (currentOptions.length === 0) {
      break;
    }
  }

  return selection;
};

// 对外部值做统一收敛，确保组件内部始终操作“可渲染、可滚动、可确认”的选择状态。
export const resolvePickerSelection = (params: {
  mode: PickerMode;
  sourceSelection: PickerSelectionState;
  normalizedColumns: PickerColumn[];
  normalizedOptions: PickerColumn;
}): PickerSelectionState => {
  const { mode, sourceSelection, normalizedColumns, normalizedOptions } = params;

  if (mode === "cascade") {
    return resolveCascadeSelection(sourceSelection, normalizedOptions);
  }

  return resolveColumnsSelection(sourceSelection, normalizedColumns);
};

// 级联模式下列数据取决于当前路径；当前层值失效时，也会回退到首个可选项后继续向下展开，
// 这样面板打开时始终有一条完整可编辑的 children 链路。
export const resolvePickerColumns = (params: {
  mode: PickerMode;
  sourceSelection: PickerSelectionState;
  normalizedColumns: PickerColumn[];
  normalizedOptions: PickerColumn;
}): PickerColumn[] => {
  const { mode, sourceSelection, normalizedColumns, normalizedOptions } = params;

  if (mode === "cascade") {
    const columns: PickerColumn[] = [];
    let currentOptions = normalizedOptions;
    let depth = 0;

    while (currentOptions.length > 0) {
      columns.push(currentOptions);

      const selected =
        findOptionByValue(currentOptions, sourceSelection[depth]) ??
        findFirstSelectable(currentOptions);

      if (!selected) {
        break;
      }

      currentOptions = selected.children;
      depth += 1;

      if (currentOptions.length === 0) {
        break;
      }
    }

    return columns;
  }

  return normalizedColumns;
};

// 面板渲染需要“选中路径”和“可渲染列”同步推导。
// shouldResolveSelection=true 用于编辑态/面板态，保证无效值会回退到可选项；
// false 用于 Picker 关闭态展示，避免 clear 后仅为了展示文案又自动补齐默认值。
export const getPickerDisplayState = (params: {
  mode: PickerMode;
  sourceSelection: PickerSelectionState;
  normalizedColumns: PickerColumn[];
  normalizedOptions: PickerColumn;
  shouldResolveSelection: boolean;
}): PickerDisplayState => {
  const {
    mode,
    sourceSelection,
    normalizedColumns,
    normalizedOptions,
    shouldResolveSelection
  } = params;
  const selection = shouldResolveSelection
    ? resolvePickerSelection({
        mode,
        sourceSelection,
        normalizedColumns,
        normalizedOptions
      })
    : sourceSelection.slice();
  const columns = resolvePickerColumns({
    mode,
    sourceSelection: selection,
    normalizedColumns,
    normalizedOptions
  });

  return {
    selection,
    columns
  };
};

// 对外输出不允许包含归一化过程中产生的 undefined，占位只属于内部推导状态。
export const getPickerOutputSelection = (
  selection: PickerSelectionState
): PickerPrimitive[] => {
  return selection.filter((item): item is PickerPrimitive => item !== undefined);
};

// 滚动定位、点击高亮和箭头禁用态都依赖同一套索引计算，集中在这里避免三处逻辑偏移。
export const getPickerColumnSelectedIndex = (
  columns: PickerColumn[],
  selection: PickerSelectionState,
  columnIndex: number
) => {
  const column = columns[columnIndex] ?? [];
  const value = selection[columnIndex];

  if (value === undefined) {
    return -1;
  }

  return column.findIndex((item) => item.value === value);
};

// 箭头步进会跳过 disabled 项，保证上下移动的结果和点击可选项的行为一致。
export const getPickerAdjacentSelectableOption = (
  columns: PickerColumn[],
  selection: PickerSelectionState,
  columnIndex: number,
  direction: PickerDirection
): PickerNode | null => {
  const column = columns[columnIndex] ?? [];
  if (column.length === 0) {
    return null;
  }

  const selectedIndex = getPickerColumnSelectedIndex(
    columns,
    selection,
    columnIndex
  );
  const step = direction === "previous" ? -1 : 1;
  const startIndex =
    selectedIndex >= 0 ? selectedIndex + step : step > 0 ? 0 : column.length - 1;

  for (
    let nextIndex = startIndex;
    nextIndex >= 0 && nextIndex < column.length;
    nextIndex += step
  ) {
    const option = column[nextIndex];

    if (option && !option.disabled) {
      return option;
    }
  }

  return null;
};

export const getPickerColumnDisplayItems = (
  columns: PickerColumn[],
  selection: PickerSelectionState,
  columnIndex: number
): PickerColumnDisplayItems => {
  const column = columns[columnIndex] ?? [];
  const selectedIndex = getPickerColumnSelectedIndex(
    columns,
    selection,
    columnIndex
  );

  return {
    previous: getPickerAdjacentSelectableOption(
      columns,
      selection,
      columnIndex,
      "previous"
    ),
    current: selectedIndex >= 0 ? column[selectedIndex] ?? null : null,
    next: getPickerAdjacentSelectableOption(columns, selection, columnIndex, "next")
  };
};

// 箭头模式只渲染三行：上一项、当前项、下一项。
// 这里统一按“可步进的可选项”计算，保证三行文案和上下箭头的真实行为一致。

// 展示文案只拼接当前有效路径，空值与失效值都不会暴露给按钮文本。
// 关闭态文案不会为了补齐级联链路而额外回填默认值，因此 clear 后会稳定回到 placeholder。
export const getPickerDisplayText = (
  columns: PickerColumn[],
  selection: PickerSelectionState,
  placeholder: string,
  separator: string
) => {
  const labels = selection
    .map((value, index) => {
      if (value === undefined) {
        return "";
      }

      const column = columns[index] ?? [];
      return column.find((item) => item.value === value)?.label ?? "";
    })
    .filter((item) => item.length > 0);

  if (labels.length === 0) {
    return placeholder;
  }

  return labels.join(separator);
};
