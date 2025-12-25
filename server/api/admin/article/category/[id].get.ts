import {
  getBadResponse,
  getNotFoundResponse,
  getOKResponse,
} from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { data: id, error } = z
    .number({ coerce: true })
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const results = await prisma.articleCategory.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  if (results === null) return getNotFoundResponse(event);

  const { _count, ...rest } = results;

  return getOKResponse(event, {
    ...rest,
    count: _count.articles ?? 0,
  });
});
