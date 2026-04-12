import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const results = await prisma.navigationShortcut.findMany({
    orderBy: { id: "desc" }
  });

  return getOKResponse(event, { data: results });
});
