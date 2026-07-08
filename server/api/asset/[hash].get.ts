import { useFileStorage } from "@@/server/utils/useFileStorage";
import { getNotFoundResponse } from "@@/server/utils/response";
import { getRouterParam, appendHeader } from "h3";
import { prisma } from "@@/server/db";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, "hash");

  if (!hash) return getNotFoundResponse(event);

  const asset = await prisma.asset.findFirst({
    where: { hash, status: 1 }
  });

  if (!asset) return getNotFoundResponse(event);

  appendHeader(event, "Content-Type", asset.mime_type ?? mime.getType(asset.ext) ?? "application/octet-stream");

  const { createReadStream, exists } = useFileStorage();
  const filename = `${asset.hash}.${asset.ext}`;

  if (!(await exists(filename))) return getNotFoundResponse(event);

  return await createReadStream(filename);
});
