import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { getQuery, getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int(),
    folder_id: z.coerce.number().int()
  });

  const query = getQuery(event);

  const { error, data: queryParams } = schema.safeParse({
    page: query.page,
    per_page: query.per_page,
    folder_id: getRouterParam(event, "id")
  });

  if (error) return getBadResponse(event, error.message);

  const folder = await prisma.imageFolder.findUnique({
    where: { id: queryParams.folder_id }
  });
  if (folder === null) return getBadResponse(event, "没有目录");

  const result = await prisma.image.findMany({
    where: { folder_id: folder.id },
    select: {
      id: true,
      width: true,
      height: true,
      hash: true,
      format: true,
      size: true,
      preview: true,
      tags: true
    },
    skip: (queryParams.page - 1) * queryParams.per_page,
    take: queryParams.per_page
  });

  const total = await prisma.image.count({
    where: { folder_id: folder.id }
  });

  return getOKResponse(event, {
    page: queryParams.page,
    per_page: queryParams.per_page,
    total,
    data: result
  });
});
