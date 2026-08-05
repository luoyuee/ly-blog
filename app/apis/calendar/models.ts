/**
 * 日期拓展数据导出/导入的单条记录。
 * @description key 为日期字符串（YYYY-MM-DD），value 为该日期的拓展字段。
 */
export type DateAttributeRecord = Record<string, Record<string, unknown>>;

/**
 * 清空日期拓展数据响应。
 */
export interface ClearDateAttributeResponse {
  /** 被删除的记录数量 */
  count: number;
}

/**
 * 导入日期拓展数据响应。
 */
export interface ImportDateAttributeResponse {
  /** 导入的记录数量 */
  count: number;
}
