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
