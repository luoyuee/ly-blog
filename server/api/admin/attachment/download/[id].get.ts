import { getBadResponse, getNotFoundResponse } from "@@/server/utils/response";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import { getRouterParam, appendHeader } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import mime from "mime";

export default defineEventHandler(async (event) => {
  const storage = useFileStorage();

  const { error, data: id } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const file = await prisma.file.findFirst({
    where: {
      id,
      status: 1
    },
    include: {
      Asset: true
    }
  });

  if (!file) return getNotFoundResponse(event);

  const filename = `${file.Asset.hash}.${file.Asset.ext}`;

  if (!(await storage.exists(filename))) return getNotFoundResponse(event);

  await prisma.file.update({
    where: { id },
    data: {
      download_count: {
        increment: 1
      }
    }
  });

  appendHeader(event, "Content-Type", file.Asset.mime_type ?? mime.getType(file.Asset.ext) ?? "application/octet-stream");
  appendHeader(event, "Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`);

  return await storage.createReadStream(filename);
});
