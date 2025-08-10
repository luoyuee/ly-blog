import { ArticleCategory } from "@prisma/client";
import { getRouterParam, getQuery } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import {
  getOKResponse,
  getBadResponse,
  getNotFoundResponse,
  getForbiddenResponse,
} from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const { error, data: articleId } = z
    .number()
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const article = await prisma.article.findUnique({
    where: { id: articleId, status: 1 },
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
  });

  if (article === null) return getNotFoundResponse(event);

  // 仅允许通过url访问
  if (article.custom_path && article.is_custom_url_only) {
    return getForbiddenResponse(event);
  }

  let locked = false;

  if (article.password) {
    const { pwd } = getQuery(event);

    locked = article.password == String(pwd);
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
    where: { id: articleId },
    data: {
      view_count: article.view_count + 1,
    },
  });

  return getOKResponse(event, result);
});
