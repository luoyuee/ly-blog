import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

const schema = z.object({
  keyword: z.string().min(1),
  limit: z.coerce.number().int().positive().default(10)
});

export default defineEventHandler(async (event) => {
  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const results = await prisma.navigationWebsite.findMany({
    where: {
      OR: [
        { name: { contains: params.keyword } },
        { url: { contains: params.keyword } },
        { description: { contains: params.keyword } },
        { tags: { path: [], string_contains: params.keyword } }
      ]
    },
    take: params.limit,
    orderBy: { id: "desc" }
  });

  return getOKResponse(event, results);
});
