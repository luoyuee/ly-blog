import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.array(
    z.object({
      name: z.string(),
      icon: z.string(),
      description: z.string(),
      image: z.string(),
      languages: z.string().array(),
      repoUrl: z.url()
    })
  );

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.WORK }
  });

  const now = new Date();

  if (config === null) {
    await prisma.config.create({
      data: {
        name: ConfigNameEnum.WORK,
        created_at: now,
        created_by: event.context.user.id,
        updated_at: now,
        data: body
      }
    });
  } else {
    await prisma.config.update({
      where: { name: ConfigNameEnum.WORK },
      data: {
        updated_at: now,
        updated_by: event.context.user.id,
        data: body
      }
    });
  }

  return getOKResponse(event);
});
