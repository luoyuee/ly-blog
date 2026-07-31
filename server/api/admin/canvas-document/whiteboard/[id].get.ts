import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

/**
 * 白板详情
 * @description 返回单个白板完整信息（含核心数据 data），供前端组件渲染
 */
export default defineEventHandler(async (event) => {
  const { data: id, error } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const result = await prisma.canvasDocument.findUnique({
    where: { id }
  });

  if (!result) return getBadResponse(event, "白板不存在");

  return getOKResponse(event, result);
});
