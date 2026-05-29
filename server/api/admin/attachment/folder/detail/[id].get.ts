import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const folder = await prisma.fileFolder.findFirst({
    where: {
      id,
      status: 1
    }
  });

  if (!folder) return getNotFoundResponse(event);

  return getOKResponse(event, folder);
});
