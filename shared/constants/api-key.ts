import type { ApiKeyDangerLevel } from "#shared/enums/api-key";
import { ApiKeyDangerLevelEnum, ApiKeyScopeEnum } from "#shared/enums/api-key";

/**
 * API Key 权限范围配置项
 */
export interface ApiKeyScopeItem {
  /** 权限标识 */
  name: string;
  /** 权限描述 */
  description: string;
  /** 危险等级 */
  dangerLevel: ApiKeyDangerLevel;
}

/**
 * API Key 权限范围配置列表
 */
export const ApiKeyScopeItems: ApiKeyScopeItem[] = [
  {
    name: ApiKeyScopeEnum.HITOKOTO_IMPORT,
    description: "允许调用一言导入接口。",
    dangerLevel: ApiKeyDangerLevelEnum.WARNING
  },
  {
    name: ApiKeyScopeEnum.NOTE_IMPORT,
    description: "允许调用文章内容包导入接口。",
    dangerLevel: ApiKeyDangerLevelEnum.DANGER
  },
  {
    name: ApiKeyScopeEnum.IMAGE_UPLOAD,
    description: "允许调用图片上传接口。",
    dangerLevel: ApiKeyDangerLevelEnum.WARNING
  }
];
