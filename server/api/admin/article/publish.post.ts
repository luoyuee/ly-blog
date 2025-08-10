import type { ArticleCategory } from "@prisma/client";
import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { getArticleTOC } from "@/utils/editor";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    note_id: z.number().int(),
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
    url_access_only: z.boolean(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const note = await prisma.note.findFirst({
    where: { id: body.note_id, status: 1 },
  });

  if (!note) return getBadResponse(event, "Note do not exist");

  let category: ArticleCategory | null = null;

  if (body.category) {
    category = await prisma.articleCategory.findFirst({
      where: { id: body.category, status: 1 },
    });
  }

  const article = await prisma.article.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      content_updated_at: note.content_updated_at,
      category: category ? category.id : undefined,
      published_at: body.publish_time
        ? new Date(body.publish_time * 1000)
        : new Date(),
      note_id: note.id,
      title: body.title,
      abstract: body.abstract,
      content: note.content,
      words: note.words,
      tags: body.tags,
      author: body.author,
      cover: body.cover,
      pin_priority: body.pinned ?? null,
      password: body.password ?? null,
      allow_comments: body.enable_comments,
      allow_rewards: body.enable_tipping,
      custom_path: body.url ? body.url : null,
      is_custom_url_only: body.url ? body.url_access_only : false,
      toc: JSON.stringify(getArticleTOC(note.content)),
    },
  });

  return getOKResponse(event, article);
});
