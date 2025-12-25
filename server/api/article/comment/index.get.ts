import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

type BaseComment = Prisma.ArticleCommentGetPayload<{
  select: {
    id: true;
    created_at: true;
    avatar: true;
    nickname: true;
    role: true;
    email: true;
    website: true;
    content: true;
    parent_id: true;
    reply_id: true;
    reply_nickname: true;
    location: true;
    platform: true;
    browser: true;
  };
}>;

export default defineEventHandler(async (event) => {
  const schema = z.object({
    article_id: z.coerce.number().int(),
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int()
  });

  const { error, data: queryParams } = schema.safeParse(getQuery(event));
  if (error) return getBadResponse(event, error.message);

  const comments = await prisma.articleComment.findMany({
    select: {
      id: true,
      created_at: true,
      avatar: true,
      nickname: true,
      role: true,
      email: true,
      website: true,
      content: true,
      parent_id: true,
      reply_id: true,
      reply_nickname: true,
      location: true,
      platform: true,
      browser: true
    },
    where: {
      status: 1,
      parent_id: null,
      reply_id: null
    },
    skip: (queryParams.page - 1) * queryParams.per_page,
    take: queryParams.per_page,
    orderBy: {
      id: "desc"
    }
  });

  const total = await prisma.articleComment.count({
    where: {
      status: 1,
      parent_id: null,
      reply_id: null
    }
  });

  const replies = await prisma.articleComment.findMany({
    select: {
      id: true,
      created_at: true,
      avatar: true,
      nickname: true,
      role: true,
      email: true,
      website: true,
      content: true,
      parent_id: true,
      reply_id: true,
      reply_nickname: true,
      location: true,
      platform: true,
      browser: true
    },
    where: {
      status: 1,
      parent_id: {
        in: comments.map((item) => item.id)
      }
    }
  });

  const replyMap: Record<number, BaseComment[]> = {};

  replies.forEach((item) => {
    if (item.parent_id) {
      if (replyMap[item.parent_id]) {
        replyMap[item.parent_id].push(item);
      } else {
        replyMap[item.parent_id] = [item];
      }
    }
  });

  return getOKResponse(event, {
    page: queryParams.page,
    per_page: queryParams.per_page,
    total,
    data: comments.map((item) => {
      return {
        ...item,
        children: replyMap[item.id] || null
      };
    })
  });
});
