import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import {
  getOKResponse,
  getBadResponse,
  getNotFoundResponse,
} from "@@/server/utils/response";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number({ coerce: true })
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const note = await prisma.note.findFirst({ where: { id, status: 1 } });

  if (note === null) return getNotFoundResponse(event);

  return getOKResponse(event, note);
});
