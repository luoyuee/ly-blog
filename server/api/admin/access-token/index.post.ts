import { createPlainAccessToken, hashAccessToken } from "@@/server/utils/auth/access-token";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { ACCESS_TOKEN_SCOPES } from "#shared/enums";
import { readBody } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

const scopeSchema = z.string().refine(
  (scope) => ACCESS_TOKEN_SCOPES.includes(scope as (typeof ACCESS_TOKEN_SCOPES)[number]),
  "Access Token 权限范围无效"
);

export default defineEventHandler(async (event) => {
  const schema = z.object({
    name: z.string().min(1).max(255),
    scopes: scopeSchema.array().min(1),
    expires_at: z.string().datetime({ offset: true }).nullable().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) return getBadResponse(event, error.message);

  const plainToken = createPlainAccessToken();
  const now = new Date();

  const token = await prisma.accessToken.create({
    data: {
      created_at: now,
      created_by: event.context.user.id,
      name: body.name,
      token_hash: hashAccessToken(plainToken),
      scopes: body.scopes,
      expires_at: body.expires_at ? new Date(body.expires_at) : null
    },
    select: {
      id: true,
      name: true,
      scopes: true,
      expires_at: true,
      created_at: true,
      created_by: true
    }
  });

  return getOKResponse(event, {
    ...token,
    token: plainToken
  });
});
