import type {
  CascaderColumn,
  CascaderDisplayState,
  CascaderFieldNames,
  CascaderItems,
  CascaderNode,
  CascaderPrimitive,
  CascaderRawOption,
  CascaderSelectionState
} from "./types";

const isPrimitive = (value: unknown): value is CascaderPrimitive => {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
};

const isRecord = (value: unknown): value is CascaderRawOption => {
  return typeof value === "object" && value !== null;
};

const normalizeNode = (
  option: CascaderRawOption,
  fieldNames: CascaderFieldNames
): CascaderNode | null => {
  const labelValue = option[fieldNames.label];
  const rawValue = option[fieldNames.value];
  const childrenValue = option[fieldNames.children];
  const leafValue = option[fieldNames.leaf];

  if (typeof labelValue !== "string" || !isPrimitive(rawValue)) {
    return null;
  }

  const children = Array.isArray(childrenValue)
    ? childrenValue
        .filter(isRecord)
        .map((item) => normalizeNode(item, fieldNames))
        .filter((item): item is CascaderNode => item !== null)
    : [];

  const explicitLeaf = typeof leafValue === "boolean" ? leafValue : undefined;

  return {
    label: labelValue,
    value: rawValue,
    disabled: Boolean(option[fieldNames.disabled]),
    leaf: explicitLeaf ?? children.length === 0,
    children
  };
};

export const normalizeCascaderItems = (
  items: CascaderItems,
  fieldNames: CascaderFieldNames
): CascaderColumn => {
  return items
    .filter(isRecord)
    .map((item) => normalizeNode(item, fieldNames))
    .filter((item): item is CascaderNode => item !== null);
};

export const findCascaderNodeByValue = (
  column: CascaderColumn,
  value: CascaderPrimitive | undefined
) => {
  if (value === undefined) {
    return null;
  }

  return column.find((item) => item.value === value) ?? null;
};

export const isCascaderSelectable = (node: CascaderNode, checkStrictly: boolean) => {
  if (node.disabled) {
    return false;
  }

  if (checkStrictly) {
    return true;
  }

  return node.leaf || node.children.length === 0;
};

export const getCascaderColumnsBySelection = (
  rootNodes: CascaderColumn,
  selection: CascaderSelectionState
): CascaderColumn[] => {
  const columns: CascaderColumn[] = [rootNodes];
  let currentColumn = rootNodes;

  selection.forEach((value) => {
    const matchedNode = findCascaderNodeByValue(currentColumn, value);

    if (!matchedNode || matchedNode.children.length === 0) {
      return;
    }

    columns.push(matchedNode.children);
    currentColumn = matchedNode.children;
  });

  return columns.filter((column) => column.length > 0);
};

export const resolveCascaderSelection = ({
  sourceSelection,
  rootNodes,
  checkStrictly
}: {
  sourceSelection: CascaderSelectionState;
  rootNodes: CascaderColumn;
  checkStrictly: boolean;
}) => {
  const selection: CascaderSelectionState = [];
  const selectedNodes: CascaderNode[] = [];
  const columns: CascaderColumn[] = [];

  let currentColumn = rootNodes;

  while (currentColumn.length > 0) {
    columns.push(currentColumn);

    const currentValue = sourceSelection[selection.length];
    const matchedNode = findCascaderNodeByValue(currentColumn, currentValue);

    if (!matchedNode) {
      break;
    }

    selection.push(matchedNode.value);
    selectedNodes.push(matchedNode);

    if (matchedNode.children.length === 0) {
      break;
    }

    currentColumn = matchedNode.children;
  }

  const lastSelectedNode = selectedNodes[selectedNodes.length - 1] ?? null;
  const isSelectable = lastSelectedNode
    ? isCascaderSelectable(lastSelectedNode, checkStrictly)
    : false;

  return {
    selection,
    columns,
    selectedNodes,
    isSelectable
  };
};

export const getCascaderDisplayState = ({
  sourceSelection,
  rootNodes,
  checkStrictly
}: {
  sourceSelection: CascaderSelectionState;
  rootNodes: CascaderColumn;
  checkStrictly: boolean;
}): CascaderDisplayState => {
  const resolved = resolveCascaderSelection({
    sourceSelection,
    rootNodes,
    checkStrictly
  });

  return {
    selection: resolved.selection,
    columns: resolved.columns.length > 0 ? resolved.columns : [rootNodes],
    selectedNodes: resolved.selectedNodes
  };
};

export const getCascaderLabelPath = (
  rootNodes: CascaderColumn,
  selection: CascaderSelectionState
) => {
  const labels: string[] = [];
  let currentColumn = rootNodes;

  selection.forEach((value) => {
    const matchedNode = findCascaderNodeByValue(currentColumn, value);

    if (!matchedNode) {
      return;
    }

    labels.push(matchedNode.label);
    currentColumn = matchedNode.children;
  });

  return labels;
};

export const getCascaderDisplayText = ({
  rootNodes,
  selection,
  placeholder,
  separator,
  showAllLevels
}: {
  rootNodes: CascaderColumn;
  selection: CascaderSelectionState;
  placeholder: string;
  separator: string;
  showAllLevels: boolean;
}) => {
  const labels = getCascaderLabelPath(rootNodes, selection);

  if (labels.length === 0) {
    return placeholder;
  }

  if (showAllLevels) {
    return labels.join(` ${separator} `);
  }

  return labels[labels.length - 1] ?? placeholder;
};

export const getCascaderOutputSelection = (
  selection: CascaderSelectionState
): CascaderPrimitive[] => {
  return selection.filter((value): value is CascaderPrimitive => value !== undefined);
};

export const getCascaderColumnKey = (column: CascaderColumn, columnIndex: number) => {
  if (column.length === 0) {
    return `empty-${columnIndex}`;
  }

  return column.map((item) => String(item.value)).join("-");
};
