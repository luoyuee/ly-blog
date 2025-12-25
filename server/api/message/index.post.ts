import type { MessageBoard } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { readBody, getRequestIP } from "h3";
import { getDeviceInfo } from "@@/server/utils/server";
import { UserRoleEnum } from "#shared/enums";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const userAgent = event.headers.get("User-Agent");

  const ip = getRequestIP(event, { xForwardedFor: true });

  const { browser, platform, location } = getDeviceInfo(userAgent, ip);

  const schema = z.object({
    avatar: z.string().max(255),
    nickname: z.string().max(100),
    email: z.email(),
    website: z.string().optional(),
    content: z.string(),
    parent_id: z.number().int().optional(),
    reply_id: z.number().int().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  let replied: MessageBoard | null = null;

  if (body.reply_id) {
    replied = await prisma.messageBoard.findUnique({
      where: { id: body.reply_id }
    });
  }

  const result = await prisma.messageBoard.create({
    data: {
      created_at: new Date(),
      email: body.email,
      website: body.website,
      avatar: body.avatar,
      nickname: body.nickname,
      content: body.content,
      parent_id: body.parent_id,
      reply_id: body.reply_id,
      reply_nickname: replied ? replied.nickname : null,
      ip,
      location,
      platform,
      browser,
      role: UserRoleEnum.VISITOR
    }
  });

  return getOKResponse(event, result);
});
