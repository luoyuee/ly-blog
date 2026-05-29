import { getBadResponse, getOKResponse, getNotFoundResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    name: z.string().min(1),
    description: z.string().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const folder = await prisma.fileFolder.findFirst({
    where: {
      id: body.id,
      status: 1
    }
  });

  if (!folder) return getNotFoundResponse(event);

  const exist = await prisma.fileFolder.findFirst({
    where: {
      name: body.name,
      id: {
        not: body.id
      },
      status: 1
    }
  });

  if (exist) return getBadResponse(event, "目录名称重复");

  await prisma.fileFolder.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      name: body.name,
      description: body.description
    }
  });

  return getOKResponse(event);
});
