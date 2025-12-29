import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { getOKResponse, getBadResponse, getNotFoundResponse } from "@@/server/utils/response";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    id: z.number().int(),
    name: z.string().max(255),
    folder_id: z.number().optional(),
    content: z.string()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const note = await prisma.note.findFirst({
    where: { id: body.id, status: 1 }
  });

  if (note === null) return getNotFoundResponse(event);

  const now = new Date();

  if (note.content !== body.content) {
    await prisma.noteVersion.create({
      data: {
        created_at: now,
        created_by: event.context.user.id,
        note_id: note.id,
        folder_id: note.folder_id,
        name: note.name,
        version: note.id,
        extension: note.extension,
        metadata: note.metadata?.toString(),
        content: note.content,
        chars: note.chars
      }
    });
  }

  const result = await prisma.note.update({
    where: {
      id: body.id
    },
    data: {
      folder_id: body.folder_id,
      name: body.name,
      content: body.content,
      chars: body.content.length,
      updated_at: now,
      updated_by: event.context.user.id,
      version: note.version + 1
    }
  });

  return getOKResponse(event, result);
});
