import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number()
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const count = await prisma.image.count({
    where: {
      folder_id: id,
    },
  });

  if (count > 0) {
    return getBadResponse(event, "目录中存在图片，无法删除");
  }

  await prisma.imageFolder.delete({ where: { id } });

  return getOKResponse(event);
});
