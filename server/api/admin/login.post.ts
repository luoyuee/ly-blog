import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { UserRoleEnum } from "#shared/enums";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";
import config from "@@/server/config";
import CryptoJS from "crypto-js";
import * as jose from "jose";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    username: z.string(),
    password: z.string(),
    remember: z.boolean().optional(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: body.username }, { email: body.username }],
      status: 1,
      role: UserRoleEnum.ADMIN,
    },
  });

  if (user === null) {
    return getBadResponse(event, "用户名或密码错误");
  }

  const password = CryptoJS.MD5(body.password).toString();

  if (user.password !== password) {
    return getBadResponse(event, "用户名或密码错误");
  }

  const secret = jose.base64url.decode(config.JWT_SECRET);

  const jwt = await new jose.EncryptJWT({
    id: user.id,
    username: user.username,
    email: user.email,
  })
    .setProtectedHeader({ alg: config.JWT_ALG, enc: config.JWT_ENC })
    .setExpirationTime(body.remember ? config.JWT_EXP_7D : config.JWT_EXP)
    .encrypt(secret);

  return getOKResponse(event, {
    username: user.username,
    email: user.email,
    token: jwt,
  });
});
