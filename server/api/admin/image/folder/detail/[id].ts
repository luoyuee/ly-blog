import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import {
  getBadResponse,
  getNotFoundResponse,
  getOKResponse,
} from "@@/server/utils/response";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number()
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const folder = await prisma.imageFolder.findUnique({
    where: { id },
  });

  if (folder === null) return getNotFoundResponse(event);

  return getOKResponse(event, folder);
});
