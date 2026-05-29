import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
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

  return getOKResponse(event, {
    id: file.id,
    created_at: file.created_at,
    created_by: file.created_by,
    updated_at: file.updated_at,
    updated_by: file.updated_by,
    folder_id: file.folder_id,
    asset_id: file.asset_id,
    filename: file.filename,
    original_name: file.original_name,
    tags: Array.isArray(file.tags) ? file.tags : undefined,
    metadata: file.metadata as Record<string, unknown> | null,
    download_count: file.download_count,
    password: file.password ?? undefined,
    ext: file.Asset.ext,
    mime_type: file.Asset.mime_type ?? undefined,
    size: file.Asset.size,
    url: `/api/admin/attachment/download/${file.id}`,
    hash: file.Asset.hash
  });
});
