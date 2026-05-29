import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int(),
    folder: z.coerce.number().int(),
    keyword: z.string().optional()
  });

  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const folder = await prisma.fileFolder.findFirst({
    where: {
      id: params.folder,
      status: 1
    }
  });

  if (!folder) return getBadResponse(event, "目录不存在");

  const where: Prisma.FileWhereInput = {
    folder_id: params.folder,
    status: 1
  };

  if (params.keyword) {
    where.OR = [
      {
        filename: {
          contains: params.keyword
        }
      },
      {
        original_name: {
          contains: params.keyword
        }
      }
    ];
  }

  const results = await prisma.file.findMany({
    where,
    include: {
      Asset: true
    },
    orderBy: {
      id: "desc"
    },
    skip: (params.page - 1) * params.per_page,
    take: params.per_page
  });

  const total = await prisma.file.count({ where });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results.map((item) => ({
      id: item.id,
      created_at: item.created_at,
      created_by: item.created_by,
      updated_at: item.updated_at,
      updated_by: item.updated_by,
      folder_id: item.folder_id,
      asset_id: item.asset_id,
      filename: item.filename,
      original_name: item.original_name,
      tags: Array.isArray(item.tags) ? item.tags : undefined,
      metadata: item.metadata as Record<string, unknown> | null,
      download_count: item.download_count,
      password: item.password ?? undefined,
      ext: item.Asset.ext,
      mime_type: item.Asset.mime_type ?? undefined,
      size: item.Asset.size,
      url: `/api/admin/attachment/download/${item.id}`,
      hash: item.Asset.hash
    }))
  });
});
