import type { MessageBoard, Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int()
  });

  const { error, data: params } = schema.safeParse(getQuery(event));
  if (error) return getBadResponse(event, error.message);

  const where: Prisma.MessageBoardWhereInput = {
    status: 1,
    OR: [{ parent_id: null }, { reply_id: null }]
  };

  const select: Prisma.MessageBoardSelect = {
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
  };

  const result = await prisma.messageBoard.findMany({
    select,
    where,
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
    orderBy: {
      id: "desc"
    }
  });

  const total = await prisma.messageBoard.count({ where });

  const replies = await prisma.messageBoard.findMany({
    select,
    where: {
      status: 1,
      parent_id: {
        in: result.map((item) => item.id)
      }
    }
  });

  const replyMap: Record<number, MessageBoard[]> = {};

  replies.forEach((item) => {
    if (item.parent_id) {
      if (replyMap[item.parent_id]) {
        replyMap[item.parent_id].push(item);
      } else {
        replyMap[item.parent_id] = [item];
      }
    }
  });

  const data = result.map((item) => ({
    ...item,
    children: replyMap[item.id] ?? undefined
  }));

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data
  });
});
