import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const file = await prisma.file.findFirst({
    where: {
      id,
      status: 1
    },
    include: {
      Asset: true
    }
  });

  if (!file) return getNotFoundResponse(event);

  await prisma.$transaction([
    prisma.file.update({
      where: { id },
      data: {
        status: 0,
        updated_at: new Date(),
        updated_by: event.context.user.id
      }
    }),
    prisma.fileFolder.update({
      where: { id: file.folder_id },
      data: {
        count: {
          decrement: 1
        },
        size: {
          decrement: file.Asset.size
        },
        updated_at: new Date(),
        updated_by: event.context.user.id
      }
    })
  ]);

  return getOKResponse(event);
});
