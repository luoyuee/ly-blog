import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const results = await prisma.articleCategory.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    where: {
      status: 1,
    },
  });

  return getOKResponse(
    event,
    results.map((item) => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        count: _count.articles,
      };
    })
  );
});
