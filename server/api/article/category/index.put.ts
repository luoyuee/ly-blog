import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number(),
    parent_id: z.number().optional(),
    name: z.string().max(255),
    icon: z.string().optional(),
    description: z.string().optional(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const result = await prisma.articleCategory.update({
    where: {
      id: body.id,
      status: 1,
    },
    data: {
      parent_id: body.parent_id,
      name: body.name,
      icon: body.icon,
      description: body.description,
      updated_at: new Date(),
    },
  });

  return getOKResponse(event, result);
});
