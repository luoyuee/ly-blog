import { getNotFoundResponse } from "@@/server/utils/response";
import { existsSync, createReadStream } from "fs";
import { getRouterParam, appendHeader } from "h3";
import config from "@@/server/config";
import mime from "mime";
import path from "path";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) return getNotFoundResponse(event);

  const url = decodeURI(slug);

  const filePath = path.join(config.STATIC_PATH, url);

  if (!existsSync(filePath)) return getNotFoundResponse(event);

  appendHeader(
    event,
    "Content-Type",
    mime.getType(filePath) ?? "application/octet-stream"
  );

  return createReadStream(filePath);
});
