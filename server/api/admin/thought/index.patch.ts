import type { Prisma } from "@prisma/client";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import {
  getBadResponse,
  getNotFoundResponse,
  getOKResponse,
} from "@@/server/utils/response";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    id: z.number().int(),
    public: z.boolean(),
    content: z.string().optional(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const record = await prisma.fleetingThought.findUnique({
    where: { id: body.id },
  });

  if (record === null) return getNotFoundResponse(event);

  const data: Prisma.FleetingThoughtUpdateInput = {
    is_public: body.public,
    updated_at: new Date(),
    updated_by: event.context.user.id,
  };

  if (body.content) {
    data.content = body.content;
  }

  await prisma.fleetingThought.update({
    where: { id: body.id },
    data,
  });

  return getOKResponse(event);
});
