import { getBadResponse, getNotFoundResponse } from "@@/server/utils/response";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import { getRouterParam, appendHeader, getQuery } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import sharp from "sharp";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const storage = useFileStorage();

  const schema = z.object({
    id: z.coerce.number().int(),
    format: z.string().optional()
  });

  const query = getQuery<{ format?: string }>(event);

  const { error, data: queryParams } = schema.safeParse({
    id: getRouterParam(event, "id"),
    format: query.format
  });

  if (error) return getBadResponse(event, error.message);

  const image = await prisma.image.findUnique({
    where: { id: queryParams.id },
    include: {
      Asset: true
    }
  });

  if (image === null) return getNotFoundResponse(event);

  const file = await storage.read(`${image.Asset.hash}.${image.Asset.ext}`);

  if (image.Asset.ext === "webp") {
    switch (queryParams.format) {
      case "jpg":
        appendHeader(event, "Content-Type", mime.getType("jpg") as string);
        return await sharp(file).jpeg().toBuffer();
      case "png":
        appendHeader(event, "Content-Type", mime.getType("png") as string);
        return await sharp(file).png().toBuffer();
      default:
        break;
    }
  }

  appendHeader(
    event,
    "Content-Type",
    image.Asset.mime_type ?? mime.getType(image.Asset.ext) ?? "application/octet-stream"
  );

  return file;
});
