import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    name: z.string().min(1, "请输入名称"),
    url: z.url("请输入有效的URL地址"),
    icon: z.string().min(1, "请输入图标"),
    description: z.string().optional(),
    status: z.number().int().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.navigationSearchEngine.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      name: body.name,
      description: body.description,
      url: body.url,
      icon: body.icon,
      status: body.status ?? 1
    }
  });

  return getOKResponse(event);
});
