import { getBadResponse, getNotAuthResponse, getOKResponse } from "@@/server/utils/response";
import { getRequestIP, readBody } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

const schema = z.object({
  search_engine_id: z.number().int(),
  keyword: z.string().min(1).max(512)
});

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return getNotAuthResponse(event, "请先登录");
  }

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const searchEngine = await prisma.navigationSearchEngine.findFirst({
    where: {
      id: body.search_engine_id,
      status: 1
    },
    select: { id: true }
  });

  if (!searchEngine) {
    return getBadResponse(event, "搜索引擎不存在或已禁用");
  }

  const result = await prisma.navigationSearchHistory.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      search_engine_id: body.search_engine_id,
      keyword: body.keyword,
      ip: getRequestIP(event, { xForwardedFor: true })
    }
  });

  return getOKResponse(event, result);
});
