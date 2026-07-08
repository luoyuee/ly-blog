/**
 * 仪表盘类型枚举
 * @description 定义仪表盘统计项的类型
 */
export const DashboardEnum = {
  /** 访问量 */
  VIEW: 1,
  /** 点赞数 */
  LIKE: 2,
  /** 评论数 */
  COMMENT: 3,
  /** API 调用次数 */
  API: 4,
  /** 页面数 */
  PAGE: 5
} as const;

/** 仪表盘类型 */
export type Dashboard = (typeof DashboardEnum)[keyof typeof DashboardEnum];
