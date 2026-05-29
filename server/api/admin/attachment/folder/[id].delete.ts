import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const folder = await prisma.fileFolder.findFirst({
    where: {
      id,
      status: 1
    }
  });

  if (!folder) return getNotFoundResponse(event);

  const count = await prisma.file.count({
    where: {
      folder_id: id,
      status: 1
    }
  });

  if (count > 0) {
    return getBadResponse(event, "目录中存在附件，无法删除");
  }

  await prisma.fileFolder.update({
    where: { id },
    data: {
      status: 0,
      updated_at: new Date(),
      updated_by: event.context.user.id
    }
  });

  return getOKResponse(event);
});
