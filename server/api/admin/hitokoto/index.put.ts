import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import z from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    id: z.number().int(),
    type: z.number().optional(),
    source: z.string().optional(),
    author: z.string().optional(),
    content: z.string(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.hitokoto.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      type: body.type,
      source: body.source,
      author: body.author,
      content: body.content,
    },
  });

  return getOKResponse(event);
});
