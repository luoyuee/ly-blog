import type { ArticleCategory } from "@@/prisma/generated/client";
import { getArticleTOC } from "@/utils/editor";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";
import { getOKResponse, getBadResponse, getNotFoundResponse } from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    title: z.string(),
    category: z.number().int(),
    author: z.string(),
    abstract: z.string(),
    tags: z.string().array(),
    publish_time: z.number(),
    cover: z.string().array(),
    pinned: z.number(),
    password: z.string(),
    enable_comments: z.boolean(),
    enable_tipping: z.boolean(),
    url: z.string(),
    url_access_only: z.boolean()
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

  if (body.category) {
    category = await prisma.articleCategory.findFirst({
      where: { id: body.category, status: 1 }
    });
  }

  await prisma.article.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      note_version: note.version,
      category_id: category ? category.id : undefined,
      published_at: body.publish_time ? new Date(body.publish_time * 1000) : new Date(),
      title: body.title,
      abstract: body.abstract,
      content: note.content,
      chars: note.chars,
      tags: body.tags,
      author: body.author,
      cover: body.cover,
      pin_priority: body.pinned ?? null,
      password: body.password ?? null,
      allow_comments: body.enable_comments,
      allow_rewards: body.enable_tipping,
      custom_url: body.url ? body.url : null,
      custom_url_access_only: body.url ? body.url_access_only : false,
      toc: JSON.stringify(getArticleTOC(note.content))
    }
  });

  return getOKResponse(event, article);
});
