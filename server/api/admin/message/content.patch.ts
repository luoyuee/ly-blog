import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    content: z.string(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) return getBadResponse(event, error.message);

  const result = await prisma.messageBoard.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      content: body.content,
    },
  });

  return getOKResponse(event, result);
});
