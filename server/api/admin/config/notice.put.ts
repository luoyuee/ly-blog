import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    card: z.object({
      content: z.string()
    }),
    toast: z.object({
      content: z.string(),
      delay: z.number(),
      position: z.string()
    }),
    modal: z.object({
      content: z.string(),
      delay: z.number(),
      fullscreen: z.boolean()
    })
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.NOTICE }
  });

  const now = new Date();

  if (config === null) {
    await prisma.config.create({
      data: {
        name: ConfigNameEnum.NOTICE,
        created_at: now,
        created_by: event.context.user.id,
        updated_at: now,
        data: body
      }
    });
  } else {
    await prisma.config.update({
      where: { name: ConfigNameEnum.NOTICE },
      data: {
        updated_at: now,
        updated_by: event.context.user.id,
        data: body
      }
    });
  }

  return getOKResponse(event);
});
