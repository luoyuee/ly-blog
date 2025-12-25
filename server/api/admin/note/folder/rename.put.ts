import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

// TODO: 需要校验重名
export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    name: z.string(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  body.name = body.name.trim();

  await prisma.noteFolder.update({
    where: { id: body.id },
    data: {
      name: body.name,
    },
  });

  return getOKResponse(event);
});
