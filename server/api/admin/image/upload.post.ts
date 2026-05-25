import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import { optimizeImage } from "@@/server/utils/image";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";
import mime from "mime";

const resolveImageFilename = async (folderId: number, originalName: string): Promise<string> => {
  const existed = await prisma.image.findFirst({
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
  const timestamp = Date.now();

  return `${basename}-${timestamp}${extension}`;
};

/**
 * 上传图片
 * 1. 检查图片格式
 * 2. 同一文件只保存一次（可有多条记录）
 * 3. 需要生成预览图，以优化性能
 */

export default defineEventHandler(async (event) => {
  const fileStorage = useFileStorage();

  const formData = await readFormData(event);

  // 读取目录信息
  const folderID = formData.get("folder");
  if (!folderID || typeof folderID !== "string") {
    return getBadResponse(event, "缺少目录ID");
  }

  const folder = await prisma.imageFolder.findUnique({
    where: { id: Number(folderID) }
  });
  if (!folder) {
    return getBadResponse(event, "目录不存在");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return getBadResponse(event, "缺少图片数据");
  }

  const tags = formData.get("tags");
  const tagArray = typeof tags === "string" ? tags.split(",") : [];

  // 原始数据
  const rawBuffer = await file.arrayBuffer();

  const optimized = await optimizeImage(rawBuffer);

  const imageHash = fileStorage.getHash(optimized.content);

  // 查询图片是否已经存在
  const exist = await prisma.image.findFirst({
    where: {
      folder_id: folder.id,
      Asset: {
        hash: imageHash
      }
    },
    include: {
      Asset: true
    }
  });

  if (!exist) {
    // 保存原始图片
    await fileStorage.save(optimized.content, optimized.format);

    // 生成并保存预览图
    const preview = await optimizeImage(optimized.content, {
      quality: 20
    });

    const previewHash = fileStorage.getHash(preview.content);

    await fileStorage.save(preview.content, preview.format);

    const now = new Date();

    const optimizedSize = fileStorage.getSize(optimized.content);
    const originalName = file.name || `${imageHash}.${optimized.format}`;
    const filename = await resolveImageFilename(folder.id, originalName);

    // 更新数据库
    const asset = await prisma.asset.upsert({
      where: { hash: imageHash },
      create: {
        created_at: now,
        created_by: event.context.user.id,
        hash: imageHash,
        ext: optimized.format,
        mime_type: mime.getType(optimized.format),
        size: optimizedSize,
        preview: previewHash,
        width: optimized.metadata.width ?? 100,
        height: optimized.metadata.height ?? 100
      },
      update: {
        updated_at: now,
        updated_by: event.context.user.id,
        preview: previewHash,
        width: optimized.metadata.width ?? 100,
        height: optimized.metadata.height ?? 100
      }
    });

    const [image] = await prisma.$transaction([
      prisma.image.create({
        data: {
          created_at: now,
          created_by: event.context.user.id,
          tags: tagArray,
          folder_id: folder.id,
          asset_id: asset.id,
          original_name: originalName,
          filename
        }
      }),

      prisma.imageFolder.update({
        where: { id: folder.id },
        data: {
          size: folder.size + optimizedSize,
          count: folder.count + 1,
          cover: `${imageHash}.${optimized.format}`
        }
      })
    ]);

    return getOKResponse(event, {
      ...image,
      hash: asset.hash,
      height: asset.height,
      width: asset.width,
      size: asset.size,
      format: asset.ext,
      preview: asset.preview
    });
  }

  return getOKResponse(event, {
    ...exist,
    hash: exist.Asset.hash,
    height: exist.Asset.height,
    width: exist.Asset.width,
    size: exist.Asset.size,
    format: exist.Asset.ext,
    preview: exist.Asset.preview
  });
});
