/**
 * 看板组件类型定义
 */

/**
 * 看板数据结构
 * @description 键为列 id，值为该列下卡片 id 数组
 * @example
 * ```ts
 * const data: KanbanData = {
 *   A: ["A1", "A2"],
 *   B: ["B1"]
 * };
 * ```
 */
export type KanbanData = Record<string, string[]>;

/**
 * 卡片透传数据类型
 * @description 用于插槽作用域渲染，支持对象、字符串、数字
 */
export type KanbanItem = Record<string, unknown> | string | number;
