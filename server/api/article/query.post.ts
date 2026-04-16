import type { ArticleCategory } from "@@/prisma/generated/client";
import { getOKResponse, getBadResponse, getNotFoundResponse } from "@@/server/utils/response";
import { findParentChain } from "@@/shared/utils/tree";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    path: z.string(),
    query: z.object({ pwd: z.string().optional() })
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const article = await prisma.article.findFirst({
    select: {
      id: true,
      created_at: true,
      created_by: true,
      updated_at: true,
      updated_by: true,
      content_updated_at: true,
      category_id: true,
      title: true,
      content: true,
      chars: true,
      tags: true,
      author: true,
      password: true,
      allow_comments: true,
      allow_rewards: true,
      custom_url: true,
      custom_url_access_only: true,
      toc: true,
      view_count: true,
      comment_count: true,
      like_count: true
    },
    where: { custom_url: body.path, status: 1 }
  });

  if (article === null) return getNotFoundResponse(event);

  let locked = false;

  if (article.password) {
    locked = true;

    if (body.query.pwd && article.password === body.query.pwd) {
      locked = false;
    }
  }

  let category: Pick<ArticleCategory, "id" | "name" | "icon" | "parent_id"> | undefined = undefined;
  let categoryLevels: Pick<ArticleCategory, "id" | "name" | "icon" | "parent_id">[] = [];

  if (article.category_id) {
    const categories = await prisma.articleCategory.findMany({
      where: { status: 1 },
      select: { id: true, parent_id: true, name: true, icon: true }
    });

    category = categories.find((item) => item.id === article.category_id);

    categoryLevels = findParentChain(categories, article.category_id, {
      idKey: "id",
      parentKey: "parent_id",
      includeSelf: true
    });
  }

  const result = {
    id: article.id,
    created_at: article.created_at,
    created_by: article.created_by,
    updated_at: article.updated_at,
    updated_by: article.updated_by,
    content_updated_at: article.content_updated_at,
    category_id: category ? category.id : undefined,
    category_name: category ? category.name : undefined,
    category_levels: categoryLevels,
    title: article.title,
    content: article.content,
    chars: article.chars,
    tags: article.tags,
    author: article.author,
    toc: article.toc,
    view_count: article.view_count,
    comment_count: article.comment_count,
    like_count: article.like_count,
    allow_comments: article.allow_comments,
    allow_rewards: article.allow_rewards,
    locked
  };

  await prisma.article.update({
    where: { id: article.id },
    data: {
      view_count: article.view_count + 1
    }
  });

  return getOKResponse(event, result);
});
