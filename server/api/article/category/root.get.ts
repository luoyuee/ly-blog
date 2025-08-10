import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const result = await prisma.articleCategory.findMany({
    where: {
      status: 1,
      parent_id: null,
    },
    select: {
      id: true,
      icon: true,
      name: true,
    },
  });

  return getOKResponse(event, result);
});
