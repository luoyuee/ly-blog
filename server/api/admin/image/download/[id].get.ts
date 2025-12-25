import { getRouterParam, appendHeader, getQuery } from "h3";
import { getBadResponse, getNotFoundResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import sharp from "sharp";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const storage = useFileStorage();

  const schema = z.object({
    id: z.number({ coerce: true }).int(),
    format: z.string().optional(),
  });

  const query = getQuery<{ format?: string }>(event);

  const { error, data: queryParams } = schema.safeParse({
    id: getRouterParam(event, "id"),
    format: query.format,
  });

  if (error) return getBadResponse(event, error.message);

  const image = await prisma.image.findUnique({
    where: { id: queryParams.id },
  });

  if (image === null) return getNotFoundResponse(event);

  const file = await storage.read(`${image.hash}.${image.format}`);

  if (image.format === "webp") {
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
    mime.getType(image.format) ?? "application/octet-stream"
  );

  return file;
});
