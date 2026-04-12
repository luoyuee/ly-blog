import type { Prisma } from "@@/prisma/generated/client";
import { getOKResponse } from "@@/server/utils/response";
import { isNil } from "#shared/utils/typed";
import { prisma } from "@@/server/db";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int(),
  per_page: z.coerce.number().int(),
  status: z.coerce.number().int().optional(),
  keyword: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.NavigationShortcutWhereInput = {};

  if (!isNil(params.status)) {
    where.status = params.status;
  }

  if (params.keyword) {
    where.OR = [
      { name: { contains: params.keyword } },
      { description: { contains: params.keyword } }
    ];
  }

  const results = await prisma.navigationShortcut.findMany({
    where,
    skip: (params.page - 1) * params.per_page,
    take: params.per_page
  });

  return getOKResponse(event, { data: results });
});
