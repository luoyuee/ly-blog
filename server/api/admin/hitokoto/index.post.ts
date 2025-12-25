import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    type: z.number().int().optional(),
    source: z.string().optional(),
    author: z.string().optional(),
    content: z.string(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.hitokoto.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      type: body.type,
      source: body.source,
      author: body.author,
      content: body.content,
      length: body.content.length,
    },
  });

  return getOKResponse(event);
});
