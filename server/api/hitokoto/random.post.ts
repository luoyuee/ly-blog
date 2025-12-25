import type { Prisma } from "@@/prisma/generated/client";
import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

const defaultHitokoto = "永远相信，美好的事情即将发生。";
const maxRetry = 100;

const getHitokotoCount = defineCachedFunction(
  async () => {
    const count = await prisma.hitokoto.count();

    return count;
  },
  {
    maxAge: 10,
  }
);

export default defineEventHandler(async (event) => {
  const schema = z.object({
    max_length: z.coerce.number().int().optional().nullable(),
    type: z.coerce.number().array().optional().nullable(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.HitokotoWhereInput = {};

  if (body.max_length) {
    where.length = { lte: body.max_length };
  }
  if (body.type && body.type.length > 0) {
    where.type = { in: body.type };
    console.log(body);
  }

  const count = await getHitokotoCount();

  if (count < 1) {
    return getOKResponse(event, {
      id: 0,
      content: defaultHitokoto,
    });
  }

  for (let i = 0; i < maxRetry; i++) {
    const randomSkip = Math.floor(Math.random() * count);
    const result = await prisma.hitokoto.findFirst({
      where,
      select: {
        id: true,
        type: true,
        author: true,
        source: true,
        content: true,
      },
      skip: randomSkip,
    });
    if (result) {
      return getOKResponse(event, {
        id: result.id,
        type: result.type,
        author: result.author,
        source: result.source,
        content: result.content,
      });
    }
  }

  return getOKResponse(event, {
    id: 0,
    content: defaultHitokoto,
  });
});
