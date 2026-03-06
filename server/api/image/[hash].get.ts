import { useFileStorage } from "@@/server/utils/useFileStorage";
import { createPlaceholderImage } from "@@/server/utils/image";
import { getNotFoundResponse } from "@@/server/utils/response";
import { getRouterParam, appendHeader } from "h3";
import { prisma } from "@@/server/db";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, "hash");
  const image = await prisma.image.findFirst({ where: { hash, status: 1 } });

  if (!image) {
    try {
      return await createPlaceholderImage();
    } catch {
      return getNotFoundResponse(event);
    }
  }

  appendHeader(event, "Content-Type", mime.getType(image.format) ?? "application/octet-stream");

  const { createReadStream, exists } = useFileStorage();

  const filename = `${image.hash}.${image.format}`;

  if (!(await exists(filename))) {
    try {
      return await createPlaceholderImage();
    } catch {
      return getNotFoundResponse(event);
    }
  }

  return await createReadStream(filename);
});
