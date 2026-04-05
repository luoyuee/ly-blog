/**
 * 查询父级节点配置选项
 */
export interface FindParentOptions<T = object> {
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
export function findParentChain<T extends object>(
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
export function findParentChainWithSelf<T extends object>(
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
export function findParentChainWithoutSelf<T extends object>(
  data: T[],
  targetId: T[keyof T],
  options: Omit<FindParentOptions<T>, "includeSelf"> = {}
): T[] {
  return findParentChain(data, targetId, { ...options, includeSelf: false });
}

/**
 * 扁平化树形结构配置选项
 */
export interface FlattenOptions<T = object> {
  /**
   * 子节点字段名，默认为 'children'
   */
  childrenKey?: keyof T;

  /**
   * 是否在节点内注入父节点ID字段，默认为 false
   */
  includeParent?: boolean;

  /**
   * 父节点ID字段名，默认为 'parentId'
   * 仅在 includeParent 为 true 时生效
   */
  parentKey?: keyof T;

  /**
   * 节点ID字段名，默认为 'id'
   * 仅在 includeParent 为 true 时生效
   */
  idKey?: keyof T;
}

/**
 * 将树形结构扁平化为一维数组
 * @param items 树形节点数组
 * @param options 配置选项
 * @returns 扁平化后的节点数组
 */
export function flattenTreeItems<T extends object>(
  items: T[],
  options: FlattenOptions<T> = {}
): T[] {
  const {
    childrenKey = "children" as keyof T,
    includeParent = false,
    parentKey = "parentId" as keyof T,
    idKey = "id" as keyof T
  } = options;

  const result: T[] = [];

  function traverse(nodes: T[], parent: T | null = null): void {
    for (const item of nodes) {
      const node = { ...item } as Record<string, unknown>;

      if (includeParent && parent) {
        node[parentKey as string] = parent[idKey];
      }

      result.push(node as T);
      const children = item[childrenKey] as unknown as T[] | undefined;
      if (children && children.length > 0) {
        traverse(children, item);
      }
    }
  }

  traverse(items);
  return result;
}

type TreeNodeId = string | number;

/**
 * 构建树节点映射配置选项
 */
export interface BuildLeafNodesMapOptions<T = object> {
  /**
   * 节点ID字段名，默认为 'id'
   */
  idKey?: keyof T;

  /**
   * 子节点字段名，默认为 'children'
   */
  childrenKey?: keyof T;
}

/**
 * 构建树节点到所有后代节点ID的映射
 * @param tree 树形结构数据
 * @param options 配置选项
 * @returns 映射对象，key为节点ID，value为所有后代节点ID数组（叶子节点为null）
 * @example
 * const tree = [
 *   { id: '1', children: [{ id: '1-1', children: [] }, { id: '1-2', children: [] }] },
 *   { id: '2', children: [] }
 * ];
 * const map = buildLeafNodesMap(tree);
 * // 结果: { '1': ['1-1', '1-2'], '1-1': null, '1-2': null, '2': null }
 */
export function buildLeafNodesMap<T extends object>(
  tree: T[],
  options: BuildLeafNodesMapOptions<T> = {}
): Record<TreeNodeId, TreeNodeId[] | null> {
  const { idKey = "id" as keyof T, childrenKey = "children" as keyof T } = options;

  const result: Record<TreeNodeId, TreeNodeId[] | null> = {};

  function traverse(node: T): TreeNodeId[] {
    const children = node[childrenKey] as unknown as T[] | undefined;
    const currentId = node[idKey] as TreeNodeId;
    const descendants: TreeNodeId[] = [];

    if (children && children.length > 0) {
      for (const child of children) {
        descendants.push(child[idKey] as TreeNodeId);
        descendants.push(...traverse(child));
      }
    }

    result[currentId] = descendants.length ? descendants : null;

    return descendants;
  }

  for (const node of tree) {
    traverse(node);
  }

  return result;
}

/**
 * 收集树形节点值的配置选项
 */
export interface CollectTreeValuesOptions<T = object, K extends keyof T = keyof T> {
  /**
   * 要收集的字段名，默认为 'id'
   */
  key?: K;
  /**
   * 子节点字段名，默认为 'children'
   */
  childrenKey?: keyof T;
  /**
   * 返回格式
   * - 'object': 返回对象数组 [{ key: value }, ...]
   * - 'value': 返回值数组 [value1, value2, ...]
   * @default 'object'
   */
  format?: "object" | "value";
}

/**
 * 收集树形结构中所有节点的指定字段值
 * @param items 树形节点数组
 * @param options 配置选项
 * @returns 根据 format 选项返回对象数组或值数组
 * @example
 * const tree = [
 *   { id: '1', children: [{ id: '1-1' }, { id: '1-2' }] },
 *   { id: '2' }
 * ];
 *
 * // 对象数组格式
 * collectTreeValues(tree, { key: 'id', format: 'object' });
 * // 返回: [{ id: '1' }, { id: '1-1' }, { id: '1-2' }, { id: '2' }]
 *
 * // 值数组格式
 * collectTreeValues(tree, { key: 'id', format: 'value' });
 * // 返回: ['1', '1-1', '1-2', '2']
 */
export function collectTreeValues<T extends object, K extends keyof T = keyof T>(
  items: T[],
  options?: CollectTreeValuesOptions<T, K> & { format?: "object" }
): { [P in K]: T[K] }[];

export function collectTreeValues<T extends object, K extends keyof T = keyof T>(
  items: T[],
  options: CollectTreeValuesOptions<T, K> & { format: "value" }
): T[K][];

export function collectTreeValues<T extends object, K extends keyof T = keyof T>(
  items: T[],
  options?: CollectTreeValuesOptions<T, K>
): { [P in K]: T[K] }[] | T[K][] {
  const { key = "id" as K, childrenKey = "children" as keyof T, format = "object" } = options || {};

  const objectResult: { [P in K]: T[K] }[] = [];
  const valueResult: T[K][] = [];

  function traverse(item: T) {
    const value = item[key];
    if (format === "object") {
      objectResult.push({ [key]: value } as { [P in K]: T[K] });
    } else {
      valueResult.push(value);
    }
    const children = item[childrenKey] as unknown as T[] | undefined;
    if (children && children.length > 0) {
      children.forEach(traverse);
    }
  }

  items.forEach(traverse);

  return format === "value" ? valueResult : objectResult;
}

/**
 * 排序扁平化树形数据配置选项
 */
export interface SortFlatTreeOptions<T = object> {
  /**
   * 节点ID字段名，默认为 'id'
   */
  idKey?: keyof T;

  /**
   * 父节点ID字段名，默认为 'parentId'
   */
  parentKey?: keyof T;
}

/**
 * 对扁平化的树形数据进行排序，使其按照从父级到子级的顺序排列
 * @param data 扁平化的树形数据列表
 * @param options 配置选项
 * @returns 排序后的数据数组
 * @example
 * const data = [
 *   { id: '3', parentId: '2' },
 *   { id: '1', parentId: null },
 *   { id: '2', parentId: '1' }
 * ];
 * sortFlatTree(data, { idKey: 'id', parentKey: 'parentId' });
 * // 返回: [{ id: '1', parentId: null }, { id: '2', parentId: '1' }, { id: '3', parentId: '2' }]
 */
export function sortFlatTree<T extends object>(
  data: T[],
  options: SortFlatTreeOptions<T> = {}
): T[] {
  const { idKey = "id" as keyof T, parentKey = "parentId" as keyof T } = options;

  // 节点ID到节点对象的映射，用于快速查找节点
  const nodeMap = new Map<unknown, T>();

  // 父节点ID到子节点数组的映射，用于构建父子关系
  const childrenMap = new Map<unknown, T[]>();

  // 根节点列表，存储没有父节点或父节点不存在的节点
  const rootNodes: T[] = [];

  // 第一次遍历：构建节点映射表
  data.forEach((node) => {
    const id = node[idKey];
    nodeMap.set(id, node);
  });

  // 第二次遍历：构建父子关系映射表，并识别根节点
  data.forEach((node) => {
    const parentId = node[parentKey];

    // 判断是否为根节点：
    // 1. parentId 为 null 或 undefined
    // 2. parentId 对应的父节点在 nodeMap 中不存在
    if (parentId === null || parentId === undefined || !nodeMap.has(parentId)) {
      rootNodes.push(node);
    } else {
      // 将当前节点添加到其父节点的子节点列表中
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(node);
    }
  });

  // 排序结果数组
  const result: T[] = [];

  /**
   * 深度优先遍历节点及其所有子节点
   * @param node 当前遍历的节点
   */
  function traverse(node: T): void {
    const id = node[idKey];

    // 将当前节点添加到结果数组
    result.push(node);

    // 递归遍历所有子节点
    const children = childrenMap.get(id);
    if (children) {
      children.forEach(traverse);
    }
  }

  // 从所有根节点开始遍历
  rootNodes.forEach(traverse);

  return result;
}

/**
 * 查询同级节点配置选项
 */
export interface FindSiblingsOptions<T = object> {
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
 * 查询指定节点的所有同级节点
 * @param data 扁平化的树形数据列表
 * @param targetId 目标节点ID
 * @param options 配置选项
 * @returns 同级节点数组
 * @example
 * const data = [
 *   { id: '1', parentId: null },
 *   { id: '2', parentId: null },
 *   { id: '3', parentId: '1' },
 *   { id: '4', parentId: '1' }
 * ];
 *
 * // 查询 id 为 '3' 的同级节点（包含自身）
 * findSiblings(data, '3', { idKey: 'id', parentKey: 'parentId' });
 * // 返回: [{ id: '3', parentId: '1' }, { id: '4', parentId: '1' }]
 *
 * // 查询 id 为 '3' 的同级节点（不包含自身）
 * findSiblings(data, '3', { idKey: 'id', parentKey: 'parentId', includeSelf: false });
 * // 返回: [{ id: '4', parentId: '1' }]
 */
export function findSiblings<T extends object>(
  data: T[],
  targetId: T[keyof T],
  options: FindSiblingsOptions<T> = {}
): T[] {
  const {
    idKey = "id" as keyof T,
    parentKey = "parentId" as keyof T,
    includeSelf = true
  } = options;

  // 查找目标节点
  const targetNode = data.find((node) => node[idKey] === targetId);

  if (!targetNode) {
    return [];
  }

  // 获取目标节点的父节点ID
  const targetParentId = targetNode[parentKey];

  // 查找所有具有相同父节点ID的节点
  const siblings = data.filter((node) => {
    const nodeParentId = node[parentKey];

    // 处理 null 和 undefined 的情况
    if (targetParentId === null || targetParentId === undefined) {
      return nodeParentId === null || nodeParentId === undefined;
    }

    return nodeParentId === targetParentId;
  });

  // 根据 includeSelf 决定是否包含自身
  if (includeSelf) {
    return siblings;
  }

  return siblings.filter((node) => node[idKey] !== targetId);
}

/**
 * 遍历树形结构配置选项
 */
export interface TraverseTreeOptions<T = object> {
  /**
   * 子节点字段名，默认为 'children'
   */
  childrenKey?: keyof T;
}

/**
 * 遍历树形结构的回调函数类型
 * @param node 当前节点
 * @param parent 父节点（根节点为 null）
 * @param depth 当前节点深度（根节点为 0）
 * @param index 在同级节点中的索引
 */
export type TraverseTreeCallback<T> = (
  node: T,
  parent: T | null,
  depth: number,
  index: number
) => boolean | undefined;

/**
 * 遍历树形结构，为每个节点执行回调函数
 * @param items 树形节点数组
 * @param callback 回调函数，返回 false 可停止遍历
 * @param options 配置选项
 * @example
 * const tree = [
 *   { id: '1', children: [{ id: '1-1' }, { id: '1-2' }] },
 *   { id: '2' }
 * ];
 *
 * traverseTree(tree, (node, parent, depth, index) => {
 *   console.log(`节点: ${node.id}, 父节点: ${parent?.id || '无'}, 深度: ${depth}, 索引: ${index}`);
 * });
 * // 输出:
 * // 节点: 1, 父节点: 无, 深度: 0, 索引: 0
 * // 节点: 1-1, 父节点: 1, 深度: 1, 索引: 0
 * // 节点: 1-2, 父节点: 1, 深度: 1, 索引: 1
 * // 节点: 2, 父节点: 无, 深度: 0, 索引: 1
 */
export function traverseTree<T extends object>(
  items: T[],
  callback: TraverseTreeCallback<T>,
  options: TraverseTreeOptions<T> = {}
): void {
  const { childrenKey = "children" as keyof T } = options;

  function traverse(nodes: T[], parent: T | null, depth: number): boolean | undefined {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;

      // 执行回调，如果返回 false 则停止遍历
      const result = callback(node, parent, depth, i);
      if (result === false) {
        return false;
      }

      // 递归遍历子节点
      const children = node[childrenKey] as unknown as T[] | undefined;
      if (children && children.length > 0) {
        const childResult = traverse(children, node, depth + 1);
        if (childResult === false) {
          return false;
        }
      }
    }
  }

  traverse(items, null, 0);
}

/**
 * 排序树形结构配置选项
 */
export interface SortTreeOptions<T = object> {
  /**
   * 子节点字段名，默认为 'children'
   */
  childrenKey?: keyof T;
}

/**
 * 树形结构排序的比较函数类型
 * 与原生 Array.sort 的比较函数一致
 * @param a 第一个节点
 * @param b 第二个节点
 * @returns 负数表示 a 在 b 前，正数表示 b 在 a 前，0 表示相等
 */
export type SortTreeCompareFn<T> = (a: T, b: T) => number;

/**
 * 对树形结构进行排序
 * @param items 树形节点数组
 * @param compareFn 比较函数，与原生 Array.sort 的比较函数一致
 * @param options 配置选项
 * @returns 排序后的新树形结构（不修改原数组）
 * @example
 * const tree = [
 *   { id: 'b', name: 'B', children: [{ id: 'b-2', name: 'B-2' }, { id: 'b-1', name: 'B-1' }] },
 *   { id: 'a', name: 'A', children: [] }
 * ];
 *
 * // 按名称升序排序
 * sortTree(tree, (a, b) => a.name.localeCompare(b.name));
 * // 返回: [
 * //   { id: 'a', name: 'A', children: [] },
 * //   { id: 'b', name: 'B', children: [{ id: 'b-1', name: 'B-1' }, { id: 'b-2', name: 'B-2' }] }
 * // ]
 *
 * // 按名称降序排序
 * sortTree(tree, (a, b) => b.name.localeCompare(a.name));
 */
export function sortTree<T extends object>(
  items: T[],
  compareFn: SortTreeCompareFn<T>,
  options: SortTreeOptions<T> = {}
): T[] {
  const { childrenKey = "children" as keyof T } = options;

  function sortNode(node: T): T {
    const children = (node as Record<string, unknown>)[childrenKey as string] as T[] | undefined;

    if (!children || children.length === 0) {
      return { ...node };
    }

    const sortedChildren = children.map(sortNode).sort(compareFn);

    return {
      ...node,
      [childrenKey]: sortedChildren
    };
  }

  return items.map(sortNode).sort(compareFn);
}

/**
 * 过滤树形节点配置选项
 */
export interface FilterTreeNodesOptions<T = object> {
  /**
   * 子节点字段名，默认为 'children'
   */
  childrenKey?: keyof T;
}

/**
 * 过滤树形节点的回调函数
 * @param node 当前节点
 * @param parent 父节点，根节点的父节点为 null
 * @returns 返回 true 保留节点，返回 false 删除节点
 */
export type FilterTreeNodesCallback<T> = (node: T, parent: T | null) => boolean;

/**
 * 过滤树形结构，类似 Array.filter
 * @param items 树形节点数组
 * @param callback 过滤回调函数，返回 true 保留节点，返回 false 删除节点
 * @param options 配置选项
 * @returns 过滤后的新树形结构（不修改原数组）
 * @example
 * const tree = [
 *   { id: '1', children: [{ id: '1-1' }, { id: '1-2' }] },
 *   { id: '2', children: [] },
 *   { id: '3' }
 * ];
 *
 * // 过滤掉 id 为 '2' 的节点
 * filterTreeNodes(tree, (node) => node.id !== '2');
 * // 返回: [
 * //   { id: '1', children: [{ id: '1-1' }, { id: '1-2' }] },
 * //   { id: '3' }
 * // ]
 *
 * // 根据父节点过滤：只保留根节点和 id 为 '1' 的子节点
 * filterTreeNodes(tree, (node, parent) => parent === null || parent.id === '1');
 * // 返回: [
 * //   { id: '1', children: [{ id: '1-1' }, { id: '1-2' }] }
 * // ]
 *
 * // 使用自定义字段名
 * const tree2 = [{ id: '1', nodes: [{ id: '1-1' }] }];
 * filterTreeNodes(tree2, (node) => node.id !== '1-1', { childrenKey: 'nodes' });
 * // 返回: [{ id: '1', nodes: [] }]
 */
export function filterTreeNodes<T extends object>(
  items: T[],
  callback: FilterTreeNodesCallback<T>,
  options: FilterTreeNodesOptions<T> = {}
): T[] {
  const { childrenKey = "children" as keyof T } = options;

  function filterNode(node: T, parent: T | null): T | null {
    if (!callback(node, parent)) {
      return null;
    }

    const children = node[childrenKey] as unknown as T[] | undefined;
    if (children && children.length > 0) {
      const filteredChildren = children
        .map((child) => filterNode(child, node))
        .filter((child): child is T => child !== null);

      return {
        ...node,
        [childrenKey]: filteredChildren
      };
    }

    return { ...node };
  }

  return items.map((item) => filterNode(item, null)).filter((item): item is T => item !== null);
}

/**
 * 查询节点深度配置选项
 */
export interface FindNodeDepthOptions<T = object> {
  /**
   * 节点ID字段名，默认为 'id'
   */
  idKey?: keyof T;

  /**
   * 父节点ID字段名，默认为 'parentId'
   */
  parentKey?: keyof T;
}

/**
 * 查询目标节点在第几级（根节点从 1 开始）
 * @param data 扁平化的树形数据列表
 * @param targetId 目标节点ID
 * @param options 配置选项
 * @returns 节点所在层级，根节点返回 1，节点不存在返回 0
 * @example
 * const data = [
 *   { id: '1', parentId: null },
 *   { id: '2', parentId: '1' },
 *   { id: '3', parentId: '2' }
 * ];
 *
 * findNodeDepth(data, '1'); // 返回: 1（根节点）
 * findNodeDepth(data, '2'); // 返回: 2
 * findNodeDepth(data, '3'); // 返回: 3
 * findNodeDepth(data, '999'); // 返回: 0（节点不存在）
 */
export function findNodeDepth<T extends object>(
  data: T[],
  targetId: T[keyof T],
  options: FindNodeDepthOptions<T> = {}
): number {
  const chain = findParentChain(data, targetId, {
    ...options,
    includeSelf: true
  });

  return chain.length;
}
