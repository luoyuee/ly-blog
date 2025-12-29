import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    name: z.string().max(255),
    folder_id: z.number().int().optional(),
    content: z.string(),
    extension: z.string().max(64)
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) return getBadResponse(event, error.message);

  console.log({
    created_at: new Date(),
    created_by: event.context.user.id,
    folder_id: body.folder_id,
    name: body.name,
    extension: body.extension,
    version: 1,
    content: body.content,
    chars: body.content.length
  });

  const result = await prisma.note.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      folder_id: body.folder_id,
      name: body.name,
      extension: body.extension,
      version: 1,
      content: body.content,
      chars: body.content.length
    }
  });

  return getOKResponse(event, result);
});
