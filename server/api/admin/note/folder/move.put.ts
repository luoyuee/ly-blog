import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

// TODO:需要检查移动目标下是否有同名文件
export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    parent_id: z.number().int().optional(),
    is_folder: z.boolean(),
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  if (body.is_folder) {
    await prisma.noteFolder.update({
      where: { id: body.id },
      data: {
        parent_id: body.parent_id,
      },
    });
  } else {
    await prisma.note.update({
      where: { id: body.id },
      data: {
        folder_id: body.parent_id,
      },
    });
  }

  return getOKResponse(event);
});
