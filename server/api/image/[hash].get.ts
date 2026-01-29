import { useFileStorage } from "@@/server/utils/useFileStorage";
import { getNotFoundResponse } from "@@/server/utils/response";
import { getRouterParam, appendHeader } from "h3";
import { prisma } from "@@/server/db";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, "hash");
  const image = await prisma.image.findFirst({ where: { hash, status: 1 } });

  if (image === null) return getNotFoundResponse(event);

  appendHeader(event, "Content-Type", mime.getType(image.format) ?? "application/octet-stream");

  const { createReadStream } = useFileStorage();

  const filename = `${image.hash}.${image.format}`;

  return createReadStream(filename);
});
