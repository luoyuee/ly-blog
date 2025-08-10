import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { Prisma } from "@prisma/client";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    page: z.number().int(),
    per_page: z.number().int(),
    kw: z.string(),
  });

  const { error, data: queryParams } = zodSchema.safeParse(getQuery(event));
  if (error) return getBadResponse(event, error.message);

  const where: Prisma.ArticleWhereInput = {
    status: 1,
    is_custom_url_only: false,
    OR: [
      {
        title: {
          contains: queryParams.kw,
        },
      },
      {
        abstract: {
          contains: queryParams.kw,
        },
      },
    ],
  };

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      category: true,
      content_updated_at: true,
      title: true,
      abstract: true,
      words: true,
      tags: true,
      author: true,
      password: true,
      created_at: true,
      updated_at: true,
      cover: true,
      pin_priority: true,
      view_count: true,
      comment_count: true,
      like_count: true,
    },
    where,
    skip: (queryParams.page - 1) * queryParams.per_page,
    take: queryParams.per_page,
    orderBy: {
      pin_priority: "desc",
      id: "asc",
    },
  });

  const total = await prisma.article.count({
    where,
  });

  const data = articles.map((item) => ({
    id: item.id,
    category: item.category,
    content_updated_at: item.content_updated_at,
    title: item.title,
    abstract: item.password ? "加密文章，点击查看详情" : item.abstract,
    words: item.words,
    tags: item.tags,
    author: item.author,
    created_at: item.created_at,
    updated_at: item.updated_at,
    cover: item.cover,
    pin_priority: item.pin_priority,
    view_count: item.view_count,
    comment_count: item.comment_count,
    like_count: item.like_count,
  }));

  return getOKResponse(event, {
    page: queryParams.page,
    per_page: queryParams.per_page,
    total,
    data,
  });
});
