import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export async function CheckDuplicateName(
  name: string,
  parent_id?: number
): Promise<boolean> {
  const res = await prisma.noteFolder.findMany({
    select: {
      id: true,
    },
    where: {
      status: 1,
      name: name,
      parent_id: {
        equals: parent_id ?? null,
      },
    },
  });
  return res.length > 0;
}

export default defineEventHandler(async (event) => {
  const schema = z.object({
    parent_id: z.number().int().optional(),
    name: z.string().max(255),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  body.name = body.name.trim();

  if (body.parent_id) {
    // 检查父级分类是否存在
    const parent = await prisma.noteFolder.findFirst({
      where: { id: body.parent_id, status: 1 },
    });

    if (parent === null) {
      return getBadResponse(event, "父级分类不存在");
    }
  }

  const isDuplicate = await CheckDuplicateName(body.name, body.parent_id);

  if (isDuplicate) return getBadResponse(event, "目录名重复");

  const result = await prisma.noteFolder.create({
    data: {
      created_by: event.context.user.id,
      created_at: new Date(),
      parent_id: body.parent_id,
      name: body.name,
      status: 1,
    },
  });

  return getOKResponse(event, result);
});
