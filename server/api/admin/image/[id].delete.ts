import { unlinkSync, existsSync } from "fs";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import {
  getBadResponse,
  getNotFoundResponse,
  getOKResponse,
} from "@@/server/utils/response";
import config from "@@/server/config";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: imageId } = z
    .number()
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const image = await prisma.image.findFirst({ where: { id: imageId } });

  if (image === null) return getNotFoundResponse(event);

  const count = await prisma.image.count({
    where: { hash: image.hash },
  });

  if (count === 0) {
    const filename = `${image.hash}.${image.format}`;

    const imagePath = `${config.IMAGE_FOLDER_PATH}/${filename}`;
    const previewPath = `${config.IMAGE_FOLDER_PATH}/preview/${filename}`;

    if (existsSync(imagePath)) unlinkSync(imagePath);
    if (existsSync(previewPath)) unlinkSync(previewPath);
  }

  await prisma.image.delete({
    where: { id: imageId },
  });
  return getOKResponse(event);
});
