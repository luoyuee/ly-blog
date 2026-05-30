/**
 * 用户角色枚举
 * @description 定义系统中的用户角色类型
 */
export const UserRoleEnum = {
  /** 管理员 */
  ADMIN: 1,
  /** 游客 */
  VISITOR: 2,
  /** 普通用户 */
  NORMAL_USER: 3
} as const;

/** 用户角色类型 */
export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];
