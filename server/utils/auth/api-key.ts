import type { EventHandlerRequest, H3Event } from "h3";
import type { ApiKeyScope } from "#shared/enums";
import { createError, getHeader, getRequestIP } from "h3";
import { API_KEY_SCOPES } from "#shared/enums";
import { prisma } from "@@/server/db";
import crypto from "node:crypto";

export interface ApiKeyPrincipal {
  id: number;
  name: string;
  scopes: ApiKeyScope[];
}

const tokenPrefix = "sk-";

const isApiKeyScope = (value: unknown): value is ApiKeyScope => {
  return typeof value === "string" && API_KEY_SCOPES.includes(value as ApiKeyScope);
};

export const createPlainApiKey = (): string => {
  return tokenPrefix + crypto.randomBytes(32).toString("base64url");
};

export const hashApiKey = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const resolveApiKey = async (
  event: H3Event<EventHandlerRequest>
): Promise<ApiKeyPrincipal | null> => {
  const authorization = getHeader(event, "Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) return null;

  const apiKey = await prisma.apiKey.findUnique({
    where: { key_hash: hashApiKey(token) }
  });

  if (!apiKey || apiKey.status !== 1) return null;
  if (apiKey.expires_at && apiKey.expires_at <= new Date()) return null;

  const scopes = Array.isArray(apiKey.scopes) ? apiKey.scopes.filter(isApiKeyScope) : [];
  const ip = getRequestIP(event, { xForwardedFor: true });

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      last_used_at: new Date(),
      last_used_ip: ip ?? undefined,
      use_count: { increment: 1 }
    }
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    scopes
  };
};

export const requireApiKey = async (
  event: H3Event<EventHandlerRequest>
): Promise<ApiKeyPrincipal> => {
  const apiKey = await resolveApiKey(event);

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      message: "API Key 无效或已过期"
    });
  }

  event.context.apiKey = apiKey;
  return apiKey;
};

export const requireApiKeyScope = (
  event: H3Event<EventHandlerRequest>,
  scope: ApiKeyScope
): void => {
  const apiKey = event.context.apiKey as ApiKeyPrincipal | undefined;

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      message: "缺少 API Key"
    });
  }

  if (!apiKey.scopes.includes(scope)) {
    throw createError({
      statusCode: 403,
      message: "API Key 权限不足"
    });
  }
};
