import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";
import mime from "mime";

const resolveAttachmentFilename = async (folderId: number, originalName: string): Promise<string> => {
  const existed = await prisma.file.findFirst({
    where: {
      folder_id: folderId,
      filename: originalName,
      status: 1
    }
  });

  if (!existed) return originalName;

  const extensionIndex = originalName.lastIndexOf(".");
  const basename = extensionIndex > 0 ? originalName.slice(0, extensionIndex) : originalName;
  const extension = extensionIndex > 0 ? originalName.slice(extensionIndex) : "";

  return `${basename}-${Date.now()}${extension}`;
};

export default defineEventHandler(async (event) => {
  const fileStorage = useFileStorage();
  const formData = await readFormData(event);

  const folderID = formData.get("folder");

  if (!folderID || typeof folderID !== "string") {
    return getBadResponse(event, "缺少目录ID");
  }

  const folder = await prisma.fileFolder.findFirst({
    where: {
      id: Number(folderID),
      status: 1
    }
  });

  if (!folder) {
    return getBadResponse(event, "目录不存在");
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return getBadResponse(event, "缺少附件数据");
  }

  const tags = formData.get("tags");
  const tagArray = typeof tags === "string" && tags.length > 0 ? tags.split(",") : [];
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = fileStorage.getHash(buffer);
  const ext = mime.getExtension(file.type || "") || (file.name.includes(".") ? file.name.split(".").pop() : "bin") || "bin";
  const size = fileStorage.getSize(buffer);
  const filename = await resolveAttachmentFilename(folder.id, file.name || `${hash}.${ext}`);

  let asset = await prisma.asset.findFirst({
    where: {
      hash,
      status: 1
    }
  });

  if (!asset) {
    await fileStorage.save(buffer, ext);

    asset = await prisma.asset.create({
      data: {
        created_at: new Date(),
        created_by: event.context.user.id,
        hash,
        ext,
        mime_type: file.type || mime.getType(ext) || "application/octet-stream",
        size
      }
    });
  }

  const created = await prisma.$transaction(async (tx) => {
    const record = await tx.file.create({
      data: {
        created_at: new Date(),
        created_by: event.context.user.id,
        folder_id: folder.id,
        asset_id: asset.id,
        original_name: file.name || filename,
        filename,
        tags: tagArray.length > 0 ? tagArray : undefined
      },
      include: {
        Asset: true
      }
    });

    await tx.fileFolder.update({
      where: { id: folder.id },
      data: {
        count: {
          increment: 1
        },
        size: {
          increment: asset.size
        },
        updated_at: new Date(),
        updated_by: event.context.user.id
      }
    });

    return record;
  });

  return getOKResponse(event, {
    id: created.id,
    created_at: created.created_at,
    created_by: created.created_by,
    updated_at: created.updated_at,
    updated_by: created.updated_by,
    folder_id: created.folder_id,
    asset_id: created.asset_id,
    filename: created.filename,
    original_name: created.original_name,
    tags: Array.isArray(created.tags) ? created.tags : undefined,
    metadata: created.metadata as Record<string, unknown> | null,
    download_count: created.download_count,
    password: created.password ?? undefined,
    ext: created.Asset.ext,
    mime_type: created.Asset.mime_type ?? undefined,
    size: created.Asset.size,
    url: `/api/admin/attachment/download/${created.id}`,
    hash: created.Asset.hash
  });
});
