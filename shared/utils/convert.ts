import { isObject } from "./typed";

/**
 * 递归删除对象中等于指定值的键
 * @param object 输入对象
 * @param deleteValue 要删除的值
 * @returns 深拷贝后的新对象（已删除匹配键）
 */
export function recursiveDelete<T extends object>(object: T, deleteValue: unknown): T {
  if (!isObject(object)) return object as T;

  const cleanedEntries = Object.entries(object)
    .map(([key, value]) => {
      if (isObject(value)) {
        return [key, recursiveDelete(value, deleteValue)];
      }
      return [key, value];
    })
    .filter(([_, value]) => value !== deleteValue);

  return Object.fromEntries(cleanedEntries) as T;
}

type PropertyKeyGeneric = string | number | symbol;

type WithChildren<T, K extends PropertyKeyGeneric> = T & { [P in K]?: T[] };

/**
 * 将数组转换为树结构
 * @param data 数组数据
 * @param options 选项
 * @returns 树结构数组
 */
export function toTree<
  T,
  IdKey extends keyof T,
  ParentKey extends keyof T,
  ChildrenKey extends PropertyKeyGeneric = "children"
>(
  data: T[],
  options?: { idKey?: IdKey; parentKey?: ParentKey; childrenKey?: ChildrenKey }
): Array<WithChildren<T, ChildrenKey>> {
  const idKey = options?.idKey ?? ("id" as IdKey);
  const parentKey = options?.parentKey ?? ("parent" as ParentKey);
  const childrenKey = options?.childrenKey ?? ("children" as ChildrenKey);

  const map = new Map<T[IdKey], WithChildren<T, ChildrenKey>>();

  for (const item of data) {
    map.set(item[idKey], item as WithChildren<T, ChildrenKey>);
  }

  const tree: Array<WithChildren<T, ChildrenKey>> = [];

  for (const item of data) {
    const parentValue = item[parentKey] as T[IdKey] | null | undefined;

    if (parentValue !== null && parentValue !== undefined) {
      const parent = map.get(parentValue);

      if (parent) {
        const children = parent[childrenKey];

        if (children) {
          children.push(item as T);
        } else {
          parent[childrenKey] = [item] as WithChildren<T, ChildrenKey>[ChildrenKey];
        }
        continue;
      }
    }
    tree.push(item as WithChildren<T, ChildrenKey>);
  }

  return tree;
}

/**
 * 对树状结构数组进行递归映射
 * 会深度遍历每一个节点，对节点本身调用 mapper，并自动处理其子节点
 *
 * @typeParam T 原始节点的数据类型
 * @typeParam R 映射后的节点数据类型，默认与 T 相同
 * @typeParam ChildrenKey 子节点字段名类型，默认 "children"
 * @param data 输入的树状结构数组
 * @param mapper 节点映射函数，仅负责处理当前节点数据，子节点由函数内部递归处理
 * @param options.childrenKey 自定义子节点字段名，默认使用 "children"
 * @returns 映射后的树状结构数组，结构与入参保持一致
 */
export function mapTree<
  T extends object,
  R extends object = T,
  ChildrenKey extends PropertyKeyGeneric = "children"
>(
  data: Array<WithChildren<T, ChildrenKey>>,
  mapper: (node: WithChildren<T, ChildrenKey>) => WithChildren<R, ChildrenKey>,
  options?: { childrenKey?: ChildrenKey }
): Array<WithChildren<R, ChildrenKey>> {
  const childrenKey = options?.childrenKey ?? ("children" as ChildrenKey);

  const mapNode = (node: WithChildren<T, ChildrenKey>): WithChildren<R, ChildrenKey> => {
    const children = node[childrenKey];
    let mappedChildren: Array<WithChildren<R, ChildrenKey>> | undefined;
    if (Array.isArray(children)) {
      mappedChildren = children.map((child) => mapNode(child));
    }
    const mappedNode = mapper(node);
    if (mappedChildren) {
      return {
        ...mappedNode,
        [childrenKey]: mappedChildren
      } as WithChildren<R, ChildrenKey>;
    }
    if (children !== undefined) {
      const { [childrenKey]: _, ...rest } = mappedNode as Record<PropertyKeyGeneric, unknown>;
      return rest as WithChildren<R, ChildrenKey>;
    }
    return mappedNode;
  };

  return data.map((item) => mapNode(item));
}
