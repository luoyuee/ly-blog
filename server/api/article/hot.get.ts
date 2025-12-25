import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    q: z.number().int()
  });

  const { error, data: queryParams } = schema.safeParse(getQuery(event));
  if (error) return getBadResponse(event, error.message);

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      category_id: true,
      content_updated_at: true,
      title: true,
      abstract: true,
      chars: true,
      tags: true,
      author: true,
      created_at: true,
      updated_at: true,
      cover: true,
      password: true,
      pin_priority: true,
      view_count: true,
      comment_count: true,
      like_count: true
    },
    where: { status: 1 },
    orderBy: { view_count: "desc" },
    skip: queryParams.q ?? 10
  });

  return getOKResponse(
    event,
    articles.map((item) => ({
      id: item.id,
      category_id: item.category_id,
      content_updated_at: item.content_updated_at,
      title: item.title,
      abstract: item.password ? "加密文章，点击查看详情" : item.abstract,
      chars: item.chars,
      tags: item.tags,
      author: item.author,
      created_at: item.created_at,
      updated_at: item.updated_at,
      cover: item.cover,
      pin_priority: item.pin_priority,
      view_count: item.view_count,
      comment_count: item.comment_count,
      like_count: item.like_count
    }))
  );
});
