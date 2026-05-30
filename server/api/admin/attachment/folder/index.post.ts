import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    name: z.string().min(1),
    icon: z.string().optional(),
    description: z.string().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const exist = await prisma.fileFolder.findFirst({
    where: {
      name: body.name,
      status: 1
    }
  });

  if (exist) return getBadResponse(event, "目录名称重复");

  const folder = await prisma.fileFolder.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      name: body.name,
      icon: body.icon,
      description: body.description
    }
  });

  return getOKResponse(event, folder);
});
