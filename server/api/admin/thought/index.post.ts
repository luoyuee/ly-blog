import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { getDeviceInfo } from "@@/server/utils/server";
import { readBody, getRequestIP } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const userAgent = event.headers.get("User-Agent");

  const ip = getRequestIP(event, { xForwardedFor: true });

  const { browser, platform, location } = getDeviceInfo(userAgent, ip);

  const schema = z.object({
    content: z.string(),
    is_public: z.coerce.boolean()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));
  if (error) {
    return getBadResponse(event, error.message);
  }

  const thought = await prisma.fleetingThought.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user ? event.context.user.id : undefined,
      content: body.content,
      platform,
      browser,
      ip,
      location,
      is_public: body.is_public
    }
  });

  return getOKResponse(event, thought);
});
