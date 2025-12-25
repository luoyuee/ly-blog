import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string().optional(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const sameType = await prisma.hitokotoType.findFirst({
    where: {
      name: body.name,
      AND: { id: { not: body.id } },
    },
  });

  if (sameType !== null) return getBadResponse(event, "名称重复");

  const data = await prisma.hitokotoType.update({
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
