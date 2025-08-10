import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const sameType = await prisma.hitokotoType.findFirst({
    where: { name: body.name },
  });

  if (sameType !== null) return getBadResponse(event, "名称重复");

  await prisma.hitokotoType.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      name: body.name,
      description: body.description,
    },
  });

  return getOKResponse(event);
});
