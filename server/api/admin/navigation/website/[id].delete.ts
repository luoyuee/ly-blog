import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { data: id, error } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  await prisma.navigationWebsite.update({
    where: { id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      status: 0
    }
  });

  return getOKResponse(event);
});
