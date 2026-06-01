import { archiveLogger } from "@@/server/utils/logger/archive-logger";

export default defineEventHandler(async (event) => {
  archiveLogger.http({
    method: event.method,
    path: event.path,
    ip: getRequestIP(event, { xForwardedFor: true }),
    userAgent: event.headers.get("User-Agent")
  });
});
