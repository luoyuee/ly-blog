import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { UserRoleEnum } from "#shared/enums";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int()
  });

  const { error, data: queryParams } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const result = await prisma.fleetingThought.findMany({
    where: { status: 1 },
    select: {
      id: true,
      created_at: true,
      content: true,
      is_public: true,
      ip: true,
      location: true,
      platform: true,
      browser: true
    },
    skip: (queryParams.page - 1) * queryParams.per_page,
    take: queryParams.per_page,
    orderBy: {
      id: "desc"
    }
  });

  const total = await prisma.fleetingThought.count({
    where: { status: 1 }
  });

  const isAdmin = event.context.user && event.context.user.role === UserRoleEnum.ADMIN;

  const data = result.map((item) => ({
    id: item.id,
    created_at: item.created_at,
    content: item.is_public || isAdmin ? item.content : "",
    is_public: item.is_public,
    ip: item.ip,
    location: item.location,
    platform: item.platform,
    browser: item.browser
  }));

  return getOKResponse(event, {
    page: queryParams.page,
    per_page: queryParams.per_page,
    total,
    data
  });
});
