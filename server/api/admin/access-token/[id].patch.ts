import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { ACCESS_TOKEN_SCOPES } from "#shared/enums";
import { getRouterParam, readBody } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

const scopeSchema = z
  .string()
  .refine(
    (scope) => ACCESS_TOKEN_SCOPES.includes(scope as (typeof ACCESS_TOKEN_SCOPES)[number]),
    "Access Token 权限范围无效"
  );

export default defineEventHandler(async (event) => {
  const idResult = z.coerce.number().int().safeParse(getRouterParam(event, "id"));
  if (idResult.error) return getBadResponse(event, idResult.error.message);

  const schema = z.object({
    name: z.string().min(1).max(255).optional(),
    scopes: scopeSchema.array().min(1).optional(),
    expires_at: z.iso.datetime({ offset: true }).nullable().optional(),
    status: z.union([z.literal(0), z.literal(1)]).optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) return getBadResponse(event, error.message);

  const token = await prisma.accessToken.findUnique({ where: { id: idResult.data } });
  if (!token) return getNotFoundResponse(event);

  await prisma.accessToken.update({
    where: { id: idResult.data },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      name: body.name,
      scopes: body.scopes,
      expires_at:
        body.expires_at === undefined
          ? undefined
          : body.expires_at === null
            ? null
            : new Date(body.expires_at),
      status: body.status
    }
  });

  return getOKResponse(event);
});
