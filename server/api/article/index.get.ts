import type { Prisma } from "@@/prisma/generated/client";
import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int(),
    category: z.coerce.number().int().optional(),
    tag: z.string().optional()
  });

  const { error, data: queryParams } = schema.safeParse(getQuery(event));
  if (error) return getBadResponse(event, error.message);

  const where: Prisma.ArticleWhereInput = {
    status: 1,
    custom_url_access_only: false
  };

  if (queryParams.category) where.category_id = queryParams.category;

  if (queryParams.tag) {
    where.tags = {
      array_contains: [queryParams.tag]
    };
  }

  const result = await prisma.article.findMany({
    select: {
      id: true,
      category_id: true,
      content_updated_at: true,
      title: true,
      abstract: true,
      chars: true,
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
      ArticleCategory: {
        select: {
          name: true,
          icon: true
        }
      }
    },
    where,
    skip: (queryParams.page - 1) * queryParams.per_page,
    take: queryParams.per_page,
    orderBy: [{ pin_priority: "desc" }, { id: "asc" }]
  });

  const total = await prisma.article.count({
    where
  });

  const data = result.map((item) => ({
    id: item.id,
    category_id: item.category_id,
    category_name: item.ArticleCategory?.name,
    category_icon: item.ArticleCategory?.icon,
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
  }));

  return getOKResponse(event, {
    page: queryParams.page,
    per_page: queryParams.per_page,
    total,
    data
  });
});
