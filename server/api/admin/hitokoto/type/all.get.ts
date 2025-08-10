import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const results = await prisma.hitokotoType.findMany({
    include: {
      _count: {
        select: { hitokotos: true },
      },
    },
  });

  return getOKResponse(
    event,
    results.map((item) => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        count: _count.hitokotos,
      };
    })
  );
});
