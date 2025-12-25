import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const { error, data: articleId } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const article = await prisma.article.findUnique({ where: { id: articleId } });

  if (article === null) return getNotFoundResponse(event);

  const result = await prisma.article.update({
    where: { id: articleId },
    data: {
      like_count: {
        increment: 1
      }
    }
  });

  return getOKResponse(event, { like_count: result.like_count });
});
