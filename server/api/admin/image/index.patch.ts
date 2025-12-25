import { prisma } from "@@/server/db";
import { readBody } from "h3";
import {
  getBadResponse,
  getNotFoundResponse,
  getOKResponse,
} from "@@/server/utils/response";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number(),
    tags: z.string().array().optional(),
  });
  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const image = await prisma.image.findUnique({ where: { id: body.id } });

  if (image === null) return getNotFoundResponse(event);

  await prisma.image.update({
    where: { id: body.id },
    data: {
      tags: body.tags ?? [],
      updated_at: new Date(),
      updated_by: event.context.user.id,
    },
  });
  return getOKResponse(event);
});
