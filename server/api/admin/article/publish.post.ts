import type { ArticleCategory } from "@@/prisma/generated/client";
import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    note_id: z.number().int(),
    title: z.string(),
    category_id: z.number().int().optional(),
    author: z.string(),
    abstract: z.string(),
    tags: z.string().array().default([]),
    published_at: z.string().optional(),
    cover: z.string().array().optional(),
    pin_priority: z.number().default(0),
    password: z.string().optional(),
    allow_comments: z.boolean(),
    allow_rewards: z.boolean(),
    custom_url: z.string().optional(),
    custom_url_access_only: z.boolean().default(false)
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const note = await prisma.note.findFirst({
    where: { id: body.note_id, status: 1 }
  });

  if (!note) return getBadResponse(event, "Note do not exist");

  let category: ArticleCategory | null = null;

  if (body.category_id) {
    category = await prisma.articleCategory.findFirst({
      where: { id: body.category_id, status: 1 }
    });
  }

  console.log("note.id", note.id);

  const ast = await parseMarkdown(note.content);

  console.log(ast.toc);

  const article = await prisma.article.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      note_id: note.id,
      note_version: note.version,
      extension: note.extension,
      content_updated_at: new Date(),
      category_id: category ? category.id : undefined,
      published_at: body.published_at ? new Date(body.published_at) : new Date(),
      title: body.title,
      abstract: body.abstract,
      content: note.content,
      chars: note.chars,
      tags: body.tags,
      author: body.author,
      cover: body.cover,
      pin_priority: body.pin_priority ?? null,
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
