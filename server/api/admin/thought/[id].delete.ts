import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number()
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  await prisma.fleetingThought.update({
    where: { id },
    data: { status: 0 },
  });

  return getOKResponse(event);
});
