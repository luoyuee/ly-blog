import { getOKResponse, getBadResponse, getNotAuthResponse } from "@@/server/utils/response";
import { handleUserAvatar } from "@@/server/utils/user";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.id) {
    return getNotAuthResponse(event);
  }

  const formData = await readFormData(event);

  const username = formData.get("username");
  const nickname = formData.get("nickname");
  const email = formData.get("email");
  const avatar = formData.get("avatar");

  const schema = z.object({
    username: z.string().min(1),
    nickname: z.string().optional(),
    email: z.email()
  });

  const { error, data: body } = schema.safeParse({
    username,
    nickname,
    email
  });

  if (error) {
    return getBadResponse(event, error.message);
  }

  const user = await prisma.user.findUnique({
    where: { id: event.context.user.id }
  });

  if (user === null) {
    return getNotAuthResponse(event);
  }

  let avatarUrl = user.avatar ?? undefined;

  if (avatar) {
    avatarUrl = await handleUserAvatar(avatar as File);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      username: body.username,
      nickname: body.nickname,
      email: body.email,
      avatar: avatarUrl
    }
  });

  return getOKResponse(event);
});
