import { getNotFoundResponse } from "@@/server/utils/response";
import { getRouterParam, appendHeader } from "h3";
import { prisma } from "@@/server/db";
import { readFileSync } from "fs";
import config from "@@/server/config";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const hash = getRouterParam(event, "hash");

  const image = await prisma.image.findFirst({ where: { hash } });

  if (image === null) return getNotFoundResponse(event);

  const file = readFileSync(
    `${config.IMAGE_FOLDER_PATH}/preview/${image.hash}.${image.format}`
  );

  appendHeader(
    event,
    "Content-Type",
    mime.getType(image.format) ?? "image/webp"
  );

  return file;
});
