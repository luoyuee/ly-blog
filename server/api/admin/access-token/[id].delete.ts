import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));
  if (error) return getBadResponse(event, error.message);

  const token = await prisma.accessToken.findUnique({ where: { id } });
  if (!token) return getNotFoundResponse(event);

  await prisma.accessToken.update({
    where: { id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      status: 0
    }
  });

  return getOKResponse(event);
});
