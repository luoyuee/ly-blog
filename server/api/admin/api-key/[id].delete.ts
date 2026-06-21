import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));
  if (error) return getBadResponse(event, error.message);

  const apiKey = await prisma.apiKey.findUnique({ where: { id } });
  if (!apiKey) return getNotFoundResponse(event);

  await prisma.apiKey.update({
    where: { id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      status: 0
    }
  });

  return getOKResponse(event);
});
