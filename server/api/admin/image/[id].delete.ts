import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const image = await prisma.image.findFirst({ where: { id } });

  if (image === null) return getNotFoundResponse(event);

  await prisma.image.update({
    where: { id },
    data: { status: 0 }
  });
  return getOKResponse(event);
});
