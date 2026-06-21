/**
 * API Key 权限范围枚举
 * @description 定义 API Key 的权限范围
 */
export const ApiKeyScopeEnum = {
  /** 一言导入权限 */
  HITOKOTO_IMPORT: "hitokoto:import",
  /** 笔记导入权限 */
  NOTE_IMPORT: "note:import",
  /** 图片上传权限 */
  IMAGE_UPLOAD: "image:upload"
} as const;

/** API Key 权限范围类型 */
export type ApiKeyScope = (typeof ApiKeyScopeEnum)[keyof typeof ApiKeyScopeEnum];

/** API Key 权限范围值列表 */
export const API_KEY_SCOPES = Object.values(ApiKeyScopeEnum);

/**
 * API Key 危险等级枚举
 * @description 定义权限范围的危险程度
 */
export const ApiKeyDangerLevelEnum = {
  /** 安全 */
  SAFE: 1,
  /** 警告 */
  WARNING: 2,
  /** 危险 */
  DANGER: 3
} as const;

/** API Key 危险等级类型 */
export type ApiKeyDangerLevel = (typeof ApiKeyDangerLevelEnum)[keyof typeof ApiKeyDangerLevelEnum];
