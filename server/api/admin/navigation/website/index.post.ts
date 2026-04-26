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
  type: z.number().int().default(1),
  hot: z.number().int().min(0).default(0),
  is_favorite: z.boolean().default(false),
  is_public: z.boolean().default(true),
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
      type: body.type,
      hot: body.hot,
      is_favorite: body.is_favorite,
      is_public: body.is_public,
      status: body.status
    }
  });

  return getOKResponse(event);
});
