import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import {
  getNotFoundResponse,
  getBadResponse,
  getOKResponse,
} from "@@/server/utils/response";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number({ coerce: true })
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const image = await prisma.image.findUnique({ where: { id } });

  if (image === null) return getNotFoundResponse(event);

  return getOKResponse(event, image);
});
