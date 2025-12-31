import type { ArticleCategory } from "@@/prisma/generated/client";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";
import { getOKResponse, getBadResponse, getNotFoundResponse } from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    title: z.string(),
    category_id: z.number().int().optional().nullable(),
    author: z.string(),
    abstract: z.string(),
    tags: z.string().array().default([]),
    published_at: z.string().optional(),
    cover: z.string().array().optional().nullable(),
    pin_priority: z.number().default(0),
    password: z.string().optional(),
    allow_comments: z.boolean(),
    allow_rewards: z.boolean(),
    custom_url: z.string().optional(),
    custom_url_access_only: z.boolean().default(false)
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const article = await prisma.article.findFirst({
    where: { id: body.id, status: 1 }
  });

  if (!article) return getNotFoundResponse(event);

  const note = await prisma.note.findFirst({
    where: { id: article.note_id, status: 1 }
  });

  if (!note) return getBadResponse(event, "Note not exist");

  let category: ArticleCategory | null = null;

  if (body.category_id) {
    category = await prisma.articleCategory.findFirst({
      where: { id: body.category_id, status: 1 }
    });
  }

  const ast = await parseMarkdown(note.content);

  await prisma.article.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      note_version: note.version,
      category_id: category ? category.id : undefined,
      published_at: body.published_at ? new Date(body.published_at) : new Date(),
      title: body.title,
      abstract: body.abstract,
      content: note.content,
      chars: note.chars,
      tags: body.tags,
      author: body.author,
      cover: body.cover ?? undefined,
      pin_priority: body.pin_priority,
      password: body.password ?? null,
      allow_comments: body.allow_comments,
      allow_rewards: body.allow_rewards,
      custom_url: body.custom_url ? body.custom_url : null,
      custom_url_access_only: body.custom_url_access_only,
      toc: (ast.toc?.links as object) ?? null
    }
  });

  return getOKResponse(event, article);
});
