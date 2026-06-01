import type { EventHandlerRequest, H3Event } from "h3";
import { requireAccessToken } from "@@/server/utils/auth/access-token";
import { runtimeLogger } from "@@/server/utils/logger";
import { UserRoleEnum } from "#shared/enums";
import { getCookie, setCookie } from "h3";
import { prisma } from "@@/server/db";
import config from "@@/server/config";
import * as jose from "jose";
import dayjs from "dayjs";

/** Admin 路由正则：匹配 /admin/*、/api/admin/*、/_nitro/tasks */
const adminRouteRegexp = new RegExp("(^/admin.*)|(^/api/admin.*)|(^/_nitro/tasks)");

/** Integration 路由正则：匹配 /api/integrations/* */
const integrationRouteRegexp = new RegExp("^/api/integrations.*");

/** 无需鉴权的路由列表 */
const ignoreRoute = [
  "^/admin/(login|register)", // 管理员登录注册页
  "^/api/admin/(login|register)"
];

/** 无需鉴权路由的正则 */
const ignoreRouteRegexp = new RegExp(`(${ignoreRoute.join(")|(")})`);

/**
 * 解析管理员会话
 * 从 Cookie 中读取 JWT，验证用户身份，必要时自动续签
 * @param event - H3 事件对象
 */
const resolveAdminSession = async (event: H3Event<EventHandlerRequest>): Promise<void> => {
  /** 从 Cookie 获取 Authorization token */
  const authorization = getCookie(event, "Authorization");

  // 无 token 则跳过解析
  if (!authorization) return;

  /** 解码 JWT 密钥 */
  const secret = jose.base64url.decode(config.JWT_SECRET);

  try {
    /** 解密 JWT 并获取 payload */
    const { payload } = await jose.jwtDecrypt(authorization, secret);

    /** 查询数据库中的用户 */
    const user = await prisma.user.findUnique({
      where: { id: payload.id as number }
    });

    // 用户存在且状态为启用 (status === 1)
    if (user && user.status === 1) {
      // 将用户信息挂载到 event.context，供后续路由使用
      event.context.user = user;

      /** 自动续签：当 token 剩余有效期不足 1 小时时刷新 */
      if (payload.exp && payload.exp - dayjs().unix() < 3600) {
        const jwt = await new jose.EncryptJWT({
          id: payload.id,
          username: payload.username,
          email: payload.email
        })
          .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
          .setExpirationTime(config.JWT_EXP)
          .encrypt(secret);

        // 更新 Cookie 中的 token
        setCookie(event, "Authorization", jwt);
      }
    }
  } catch (error) {
    // JWT 解析失败（过期、篡改等），静默处理
    runtimeLogger.debug(String(error));
  }
};

/**
 * 全局认证中间件
 * 处理所有请求的权限校验，根据路由类型执行不同的鉴权策略
 */
export default defineEventHandler(async (event) => {
  // 1. 先尝试解析管理员会话（如果有 Cookie 的话）
  await resolveAdminSession(event);

  // 2. 忽略路由：登录/注册页面，直接放行
  if (ignoreRouteRegexp.test(event.path)) return;

  // 3. Integration 路由：使用 Access Token 鉴权（外部 API 访问）
  if (integrationRouteRegexp.test(event.path)) {
    await requireAccessToken(event);
    return;
  }

  // 4. Admin 路由：需要管理员登录
  if (adminRouteRegexp.test(event.path)) {
    // 已登录且为管理员，直接放行
    if (event.context.user && event.context.user.role === UserRoleEnum.ADMIN) return;

    // 未登录：非 API 路由重定向到登录页
    if (!/^\/api\/.+/.test(event.path)) {
      await sendRedirect(event, "/admin/login", 302);
    }

    // API 路由返回 403 错误
    throw createError({
      statusCode: 403,
      message: "no authorization"
    });
  }

  // 5. 其他路由：无需鉴权，直接放行
});
