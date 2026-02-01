import { getCookie, setCookie } from "h3";
import { prisma } from "@@/server/db";
import config from "@@/server/config";
import * as jose from "jose";
import dayjs from "dayjs";

const adminRouteRegexp = new RegExp("(^/admin.*)|(^/api/admin.*)|(^/_nitro/tasks)");
const ignoreRoute = [
  "^/admin/(login|register)", // 管理员登录注册页
  "^/api/admin/(login|register)",
];
const ignoreRouteRegexp = new RegExp(`(${ignoreRoute.join(")|(")})`);

export default defineEventHandler(async (event) => {
  // 解析token
  const authorization = getCookie(event, "Authorization");

  if (authorization) {
    const secret = jose.base64url.decode(config.JWT_SECRET);
    try {
      const { payload } = await jose.jwtDecrypt(authorization, secret);
      const user = await prisma.user.findUnique({
        where: { id: payload.id as number },
      });

      if (user && user.status === 1) {
        event.context.user = user;

        // 自动续签token
        if (payload.exp && payload.exp - dayjs().unix() < 3600) {
          const jwt = await new jose.EncryptJWT({
            id: payload.id,
            username: payload.username,
            email: payload.email,
          })
            .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
            .setExpirationTime(config.JWT_EXP)
            .encrypt(secret);

          setCookie(event, "Authorization", jwt);
        }
      }
    } catch (error) {
      console.log(String(error));
    }
  }

  if (
    adminRouteRegexp.test(event.path) &&
    !ignoreRouteRegexp.test(event.path)
  ) {
    if (event.context.user) return;

    if (!/^\/api\/.+/.test(event.path)) {
      await sendRedirect(event, "/admin/login", 302);
    }
    throw createError({
      statusCode: 403,
      message: "no authorization",
    });
  }
});
