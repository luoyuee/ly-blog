import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string().optional(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const exist = await prisma.imageFolder.findFirst({
    where: {
      name: body.name,
      id: {
        not: body.id,
      },
    },
  });

  if (exist !== null) return getBadResponse(event, "目录名称重复");

  await prisma.imageFolder.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      name: body.name,
      description: body.description,
    },
  });

  return getOKResponse(event);
});
