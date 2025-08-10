import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    page: z.number({ coerce: true }).int(),
    per_page: z.number({ coerce: true }).int(),
  });

  const { error, data: params } = zodSchema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const results = await prisma.article.findMany({
    where: { status: 1 },
    select: {
      id: true,
      category: true,
      content_updated_at: true,
      title: true,
      abstract: true,
      words: true,
      tags: true,
      author: true,
      created_at: true,
      updated_at: true,
      cover: true,
      pin_priority: true,
      password: true,
      allow_comments: true,
      allow_rewards: true,
      custom_path: true,
      is_custom_url_only: true,
      view_count: true,
      comment_count: true,
      like_count: true,
    },
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
  });

  const total = await prisma.article.count({
    where: { status: 1 },
  });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results,
  });
});
