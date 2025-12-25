import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import { getOKResponse, getBadResponse, getNotFoundResponse } from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const article = await prisma.article.findFirst({
    where: { id, status: 1 }
  });

  if (article === null) return getNotFoundResponse(event);

  return getOKResponse(event, article);
});
