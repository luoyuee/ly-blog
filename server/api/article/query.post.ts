import { ArticleCategory } from "@prisma/client";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";
import {
  getOKResponse,
  getBadResponse,
  getNotFoundResponse,
} from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    path: z.string(),
    query: z.object({ pwd: z.string().optional() }),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const article = await prisma.article.findFirst({
    select: {
      id: true,
      created_at: true,
      created_by: true,
      updated_at: true,
      updated_by: true,
      content_updated_at: true,
      category: true,
      title: true,
      content: true,
      words: true,
      tags: true,
      author: true,
      password: true,
      allow_comments: true,
      allow_rewards: true,
      custom_path: true,
      is_custom_url_only: true,
      toc: true,
      view_count: true,
      comment_count: true,
      like_count: true,
    },
    where: { custom_path: body.path, status: 1 },
  });

  if (article === null) return getNotFoundResponse(event);

  let locked = false;

  if (article.password) {
    locked = true;

    if (body.query.pwd && article.password === body.query.pwd) {
      locked = false;
    }
  }

  let category: ArticleCategory | null = null;

  if (article.category) {
    category = await prisma.articleCategory.findUnique({
      where: {
        id: article.category,
        status: 1,
      },
    });
  }

  const result = {
    id: article.id,
    created_at: article.created_at,
    created_by: article.created_by,
    updated_at: article.updated_at,
    updated_by: article.updated_by,
    content_updated_at: article.content_updated_at,
    category: category ? category.id : undefined,
    category_name: category ? category.name : undefined,
    title: article.title,
    content: article.content,
    words: article.words,
    tags: article.tags,
    author: article.author,
    toc: article.toc,
    view_count: article.view_count,
    comment_count: article.comment_count,
    like_count: article.like_count,
    allow_comments: article.allow_comments,
    allow_rewards: article.allow_rewards,
    locked,
  };

  await prisma.article.update({
    where: { id: article.id },
    data: {
      view_count: article.view_count + 1,
    },
  });

  return getOKResponse(event, result);
});
