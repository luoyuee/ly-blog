import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import { optimizeImage } from "@@/server/utils/image";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";

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
    where: { hash: imageHash, folder_id: folder.id }
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

    // 更新数据库
    const [data] = await prisma.$transaction([
      prisma.image.create({
        data: {
          created_at: now,
          created_by: event.context.user.id,
          tags: tagArray,
          folder_id: folder.id,
          width: optimized.metadata.width ?? 100,
          height: optimized.metadata.height ?? 100,
          size: optimizedSize,
          format: optimized.format,
          hash: imageHash,
          preview: previewHash
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

    return getOKResponse(event, data);
  }

  return getOKResponse(event, exist);
});
