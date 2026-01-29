import { useFileStorage } from "@@/server/utils/useFileStorage";
import { getNotFoundResponse } from "@@/server/utils/response";
import { createReadStream } from "fs";
import { getRouterParam, appendHeader } from "h3";
import mime from "mime";


export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    return getNotFoundResponse(event);
  }

  const storage = useFileStorage();

  const exist = await storage.exists(slug);

  if (!exist) {
    return getNotFoundResponse(event);
  }

  const filePath = await storage.getPath(slug);

  appendHeader(
    event,
    "Content-Type",
    mime.getType(filePath) ?? "application/octet-stream"
  );

  return createReadStream(filePath);
});
