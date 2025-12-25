import { getNotFoundResponse } from "@@/server/utils/response";
import { getRouterParam, appendHeader } from "h3";
import { createReadStream } from "fs";
import { prisma } from "@@/server/db";
import config from "@@/server/config";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, "hash");
  const image = await prisma.image.findFirst({ where: { hash } });

  if (image === null) return getNotFoundResponse(event);

  appendHeader(
    event,
    "Content-Type",
    mime.getType(image.format) ?? "application/octet-stream"
  );

  return createReadStream(
    `${config.IMAGE_FOLDER_PATH}/${image.hash}.${image.format}`
  );
});
