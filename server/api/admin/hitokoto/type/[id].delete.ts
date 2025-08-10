import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number({ coerce: true })
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const count = await prisma.hitokoto.count({ where: { type: id } });

  if (count > 0) {
    return getBadResponse(event, "该分类下还有内容，无法删除");
  }

  await prisma.hitokotoType.delete({
    where: { id },
  });

  return getOKResponse(event);
});
