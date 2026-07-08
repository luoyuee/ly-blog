import { useFileStorage } from "@@/server/utils/useFileStorage";
import { createPlaceholderImage } from "@@/server/utils/image";
import { getNotFoundResponse } from "@@/server/utils/response";
import { getRouterParam, appendHeader } from "h3";
import { prisma } from "@@/server/db";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, "hash");
  const asset = await prisma.asset.findFirst({ where: { hash, status: 1 } });

  if (!asset) {
    try {
      return await createPlaceholderImage();
    } catch {
      return getNotFoundResponse(event);
    }
  }

  appendHeader(event, "Content-Type", asset.mime_type ?? mime.getType(asset.ext) ?? "application/octet-stream");

  const { createReadStream, exists } = useFileStorage();

  const filename = `${asset.hash}.${asset.ext}`;

  if (!(await exists(filename))) {
    try {
      return await createPlaceholderImage();
    } catch {
      return getNotFoundResponse(event);
    }
  }

  return await createReadStream(filename);
});
