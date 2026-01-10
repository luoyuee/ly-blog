import { getBadResponse, getNotAuthResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";
import CryptoJS from "crypto-js";

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.id) {
    return getNotAuthResponse(event);
  }

  const schema = z.object({
    old_password: z.string().min(1),
    new_password: z.string().min(6)
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) {
    return getBadResponse(event, error.message);
  }

  const user = await prisma.user.findUnique({
    where: { id: event.context.user.id }
  });

  if (user === null) {
    return getNotAuthResponse(event);
  }

  const oldPassword = CryptoJS.MD5(body.old_password).toString();

  if (user.password !== oldPassword) {
    return getBadResponse(event, "原密码错误");
  }

  const newPassword = CryptoJS.MD5(body.new_password).toString();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      updated_by: user.id,
      updated_at: new Date(),
      password: newPassword
    }
  });

  return getOKResponse(event);
});
