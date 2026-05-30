/**
 * 配置名称枚举
 * @description 定义系统配置项的名称分类
 */
export const ConfigNameEnum = {
  /** 客户端配置 */
  CLIENT: "client",
  /** 服务端配置 */
  SERVER: "server",
  /** 个人页配置 */
  ME_PAGE: "me_page",
  /** 作品配置 */
  WORK: "work",
  /** 公告配置 */
  NOTICE: "notice"
} as const;

/** 配置名称类型 */
export type ConfigName = (typeof ConfigNameEnum)[keyof typeof ConfigNameEnum];
