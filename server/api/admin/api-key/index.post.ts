import { createPlainApiKey, hashApiKey } from "@@/server/utils/auth/api-key";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { API_KEY_SCOPES } from "#shared/enums";
import { readBody } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

const scopeSchema = z.string().refine(
  (scope) => API_KEY_SCOPES.includes(scope as (typeof API_KEY_SCOPES)[number]),
  "API Key 权限范围无效"
);

export default defineEventHandler(async (event) => {
  const schema = z.object({
    name: z.string().min(1).max(255),
    scopes: scopeSchema.array().min(1),
    expires_at: z.string().datetime({ offset: true }).nullable().optional()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) return getBadResponse(event, error.message);

  const plainApiKey = createPlainApiKey();
  const now = new Date();

  const apiKey = await prisma.apiKey.create({
    data: {
      created_at: now,
      created_by: event.context.user.id,
      name: body.name,
      key_hash: hashApiKey(plainApiKey),
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
    ...apiKey,
    secret_key: plainApiKey
  });
});
