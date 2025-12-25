import type { ArticleComment } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { getDeviceInfo } from "@@/server/utils/server";
import { readBody, getRequestIP } from "h3";
import { UserRoleEnum } from "#shared/enums";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const userAgent = event.headers.get("User-Agent");

  const ip = getRequestIP(event, { xForwardedFor: true });

  const { browser, platform, location } = getDeviceInfo(userAgent, ip);

  const schema = z.object({
    article_id: z.number().int(),
    avatar: z.string().max(255).optional(),
    nickname: z.string().max(100),
    email: z.string().email(),
    website: z.string().optional(),
    content: z.string().min(1),
    parent_id: z.number().int().optional(),
    reply_id: z.number().int().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) return getBadResponse(event, error.message);

  let repliedComment: ArticleComment | null = null;

  if (body.reply_id) {
    repliedComment = await prisma.articleComment.findUnique({
      where: {
        id: body.reply_id
      }
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.articleComment.create({
      data: {
        created_at: new Date(),
        article_id: body.article_id,
        avatar: body.avatar,
        nickname: body.nickname,
        role: UserRoleEnum.VISITOR,
        email: body.email,
        website: body.website,
        content: body.content,
        parent_id: body.parent_id,
        reply_id: body.reply_id,
        reply_nickname: repliedComment ? repliedComment.nickname : null,
        platform,
        browser,
        ip,
        location
      }
    });

    const count = await tx.articleComment.count({
      where: {
        article_id: body.article_id,
        status: 1
      }
    });

    await tx.article.update({
      data: { comment_count: count },
      where: {
        id: body.article_id,
        status: 1
      }
    });

    return comment;
  });

  return getOKResponse(event, result);
});
