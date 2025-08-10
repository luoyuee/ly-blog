import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

import { getBadResponse, getOKResponse } from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const { data: id, error } = z
    .number({ coerce: true })
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  await prisma.hitokoto.delete({
    where: { id },
  });

  return getOKResponse(event);
});
