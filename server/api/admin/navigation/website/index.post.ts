import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  url: z.url("请输入有效的URL地址"),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional().nullable(),
  description: z.string().optional(),
  status: z.number().int().default(1)
});

export default defineEventHandler(async (event) => {
  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.navigationWebsite.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      name: body.name,
      url: body.url,
      icon: body.icon,
      tags: body.tags || undefined,
      description: body.description,
      status: body.status
    }
  });

  return getOKResponse(event);
});
