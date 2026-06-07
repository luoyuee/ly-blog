import { AccessTokenScopeEnum, AccessTokenDangerLevelEnum } from "#shared/enums/access-token";
import type { AccessTokenDangerLevel } from "#shared/enums/access-token";

/**
 * 权限范围配置项
 */
export interface AccessTokenScopeItem {
  /** 权限标识 */
  name: string;
  /** 权限描述 */
  description: string;
  /** 危险等级 */
  dangerLevel: AccessTokenDangerLevel;
}

/**
 * 访问令牌权限范围配置列表
 */
export const AccessTokenScopeItems: AccessTokenScopeItem[] = [
  {
    name: AccessTokenScopeEnum.HITOKOTO_IMPORT,
    description: "允许调用一言导入接口。",
    dangerLevel: AccessTokenDangerLevelEnum.WARNING
  },
  {
    name: AccessTokenScopeEnum.NOTE_IMPORT,
    description: "允许调用文章内容包导入接口。",
    dangerLevel: AccessTokenDangerLevelEnum.DANGER
  }
];
