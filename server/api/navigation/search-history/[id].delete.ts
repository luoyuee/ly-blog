import { getBadResponse, getNotAuthResponse, getOKResponse } from "@@/server/utils/response";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return getNotAuthResponse(event, "请先登录");
  }

  const { data: id, error } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  await prisma.navigationSearchHistory.deleteMany({
    where: {
      id,
      created_by: event.context.user.id
    }
  });

  return getOKResponse(event);
});
