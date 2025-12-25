/**
 * 将指定键转为必填的通用类型工具
 * @template T - 原始类型
 * @template K - 需要必填的键（联合类型）
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & // 保留原始类型中非指定键的部分
  Required<Pick<T, K>>; // 将指定键转为必填
