import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const data = await prisma.hitokotoType.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return getOKResponse(event, data);
});
