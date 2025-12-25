/**
 * 查询父级节点配置选项
 */
export interface FindParentOptions<T = Record<string, unknown>> {
  /**
   * 节点ID字段名，默认为 'id'
   */
  idKey?: keyof T;

  /**
   * 父节点ID字段名，默认为 'parentId'
   */
  parentKey?: keyof T;

  /**
   * 是否包含自身节点，默认为 true
   */
  includeSelf?: boolean;
}

/**
 * 查询指定节点的所有父级节点
 * @param data 扁平化的树形数据列表
 * @param targetId 目标节点ID
 * @param options 配置选项
 * @returns 包含自身在内的父级节点数组，顺序为父级到子级
 */
export function findParentChain<T extends Record<string, unknown>>(
  data: T[],
  targetId: T[keyof T],
  options: FindParentOptions<T> = {}
): T[] {
  const {
    idKey = "id" as keyof T,
    parentKey = "parentId" as keyof T,
    includeSelf = true
  } = options;

  // 创建节点映射，便于快速查找
  const nodeMap = new Map<T[keyof T], T>();

  data.forEach((node) => {
    nodeMap.set(node[idKey], node);
  });

  const result: T[] = [];

  // 如果包含自身，先添加自身节点
  if (includeSelf) {
    const targetNode = nodeMap.get(targetId);
    if (targetNode) {
      result.push(targetNode);
    }
  }

  // 递归查找父级节点
  let currentNode = nodeMap.get(targetId);
  while (currentNode && currentNode[parentKey] !== null && currentNode[parentKey] !== undefined) {
    const parentId = currentNode[parentKey];
    const parentNode = nodeMap.get(parentId);

    if (parentNode) {
      result.unshift(parentNode); // 在数组开头插入，保持父级到子级的顺序
      currentNode = parentNode;
    } else {
      break; // 父节点不存在，停止查找
    }
  }

  return result;
}

/**
 * 查询指定节点的所有父级节点（包含自身）
 * 顺序为父级到子级
 */
export function findParentChainWithSelf<T extends Record<string, unknown>>(
  data: T[],
  targetId: T[keyof T],
  options: Omit<FindParentOptions<T>, "includeSelf"> = {}
): T[] {
  return findParentChain(data, targetId, { ...options, includeSelf: true });
}

/**
 * 查询指定节点的所有父级节点（不包含自身）
 * 顺序为父级到子级
 */
export function findParentChainWithoutSelf<T extends Record<string, unknown>>(
  data: T[],
  targetId: T[keyof T],
  options: Omit<FindParentOptions<T>, "includeSelf"> = {}
): T[] {
  return findParentChain(data, targetId, { ...options, includeSelf: false });
}
