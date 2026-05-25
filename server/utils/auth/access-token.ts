import { ACCESS_TOKEN_SCOPES } from "#shared/enums";
import type { AccessTokenScope } from "#shared/enums";
import type { EventHandlerRequest, H3Event } from "h3";
import { createError, getHeader, getRequestIP } from "h3";
import { prisma } from "@@/server/db";
import crypto from "node:crypto";

export interface AccessTokenPrincipal {
  id: number;
  name: string;
  scopes: AccessTokenScope[];
}

const tokenPrefix = "sk-";

const isAccessTokenScope = (value: unknown): value is AccessTokenScope => {
  return typeof value === "string" && ACCESS_TOKEN_SCOPES.includes(value as AccessTokenScope);
};

export const createPlainAccessToken = (): string => {
  return tokenPrefix + crypto.randomBytes(32).toString("base64url");
};

export const hashAccessToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const resolveAccessToken = async (
  event: H3Event<EventHandlerRequest>
): Promise<AccessTokenPrincipal | null> => {
  const authorization = getHeader(event, "Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

  if (!token) return null;

  const accessToken = await prisma.accessToken.findUnique({
    where: { token_hash: hashAccessToken(token) }
  });

  if (!accessToken || accessToken.status !== 1) return null;
  if (accessToken.expires_at && accessToken.expires_at <= new Date()) return null;

  const scopes = Array.isArray(accessToken.scopes) ? accessToken.scopes.filter(isAccessTokenScope) : [];
  const ip = getRequestIP(event, { xForwardedFor: true });

  await prisma.accessToken.update({
    where: { id: accessToken.id },
    data: {
      last_used_at: new Date(),
      last_used_ip: ip ?? undefined,
      use_count: { increment: 1 }
    }
  });

  return {
    id: accessToken.id,
    name: accessToken.name,
    scopes
  };
};

export const requireAccessToken = async (event: H3Event<EventHandlerRequest>): Promise<AccessTokenPrincipal> => {
  const token = await resolveAccessToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Access Token 无效或已过期"
    });
  }

  event.context.accessToken = token;
  return token;
};

export const requireAccessScope = (event: H3Event<EventHandlerRequest>, scope: AccessTokenScope): void => {
  const token = event.context.accessToken as AccessTokenPrincipal | undefined;

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "缺少 Access Token"
    });
  }

  if (!token.scopes.includes(scope)) {
    throw createError({
      statusCode: 403,
      message: "Access Token 权限不足"
    });
  }
};
