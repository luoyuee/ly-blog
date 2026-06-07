/**
 * 访问令牌权限范围枚举
 * @description 定义 API 访问令牌的权限范围
 */
export const AccessTokenScopeEnum = {
  /** 一言导入权限 */
  HITOKOTO_IMPORT: "hitokoto:import",
  /** 笔记导入权限 */
  NOTE_IMPORT: "note:import"
} as const;

/** 访问令牌权限范围类型 */
export type AccessTokenScope = (typeof AccessTokenScopeEnum)[keyof typeof AccessTokenScopeEnum];

/** 访问令牌权限范围值列表 */
export const ACCESS_TOKEN_SCOPES = Object.values(AccessTokenScopeEnum);

/**
 * 访问令牌危险等级枚举
 * @description 定义权限范围的危险程度
 */
export const AccessTokenDangerLevelEnum = {
  /** 安全 */
  SAFE: 1,
  /** 警告 */
  WARNING: 2,
  /** 危险 */
  DANGER: 3
} as const;

/** 访问令牌危险等级类型 */
export type AccessTokenDangerLevel =
  (typeof AccessTokenDangerLevelEnum)[keyof typeof AccessTokenDangerLevelEnum];
