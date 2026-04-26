import type { Prisma } from "@@/prisma/generated/client";
import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const where: Prisma.NavigationSearchEngineWhereInput = {
    status: 1
  };

  if (!event.context.user) {
    where.is_public = true;
  }

  const results = await prisma.navigationSearchEngine.findMany({
    where,
    orderBy: { id: "desc" }
  });

  return getOKResponse(event, { data: results });
});
