import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(1000).default(20)
  });

  const { error, data: params } = schema.safeParse(getQuery(event));
  if (error) return getBadResponse(event, error.message);

  const where = { status: 1 };

  const [data, total] = await Promise.all([
    prisma.apiKey.findMany({
      where,
      select: {
        id: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
        name: true,
        scopes: true,
        expires_at: true,
        last_used_at: true,
        last_used_ip: true,
        use_count: true,
        status: true
      },
      orderBy: { id: "desc" },
      skip: (params.page - 1) * params.per_page,
      take: params.per_page
    }),
    prisma.apiKey.count({ where })
  ]);

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data
  });
});
