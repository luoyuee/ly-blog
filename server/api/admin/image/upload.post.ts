import type { ImageFormat } from "#shared/types";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import sharp from "sharp";

/**
 * 上传图片
 * 1. 检查图片格式
 * 2. 同一文件只保存一次（可有多条记录）,第二次上传时合并tag
 * 3. 需要生成预览图，以优化性能
 */

export default defineEventHandler(async (event) => {
  const storage = useFileStorage();

  const formData = await readFormData(event);

  // 读取目录信息
  const folderID = formData.get("folder");
  if (!folderID || typeof folderID !== "string") {
    return getBadResponse(event, "缺少目录ID");
  }

  const folder = await prisma.imageFolder.findUnique({
    where: { id: Number(folderID) },
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

  // 判断文件类型
  const fileType = await fileTypeFromBuffer(rawBuffer);
  if (!fileType) {
    return getBadResponse(event, "不支持此格式");
  }

  let transformer = sharp(rawBuffer);
  let format: ImageFormat = "webp";

  switch (fileType.ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      transformer = transformer.webp({
        quality: 100,
      });
      break;
    case "gif":
      format = "gif";
      break;
    case "xml":
      format = "svg";
      break;
    default:
      return getBadResponse(event, "不支持此格式");
  }

  const imageBuffer = await transformer.toBuffer();
  const imageHash = storage.getHash(imageBuffer);
  console.log(imageHash);

  // 查询图片是否已经存在
  const exist = await prisma.image.findFirst({
    where: { hash: imageHash, folder_id: folder.id },
  });

  if (!exist) {
    // 保存原始图片
    await storage.save(imageBuffer, format);

    // 生成并保存预览图
    const previewBuffer = await transformer.webp({ quality: 20 }).toBuffer();
    const previewHash = storage.getHash(previewBuffer);

    await storage.save(previewBuffer, format);

    // 获取图片元数据
    const metadata = await transformer.metadata();
    const now = new Date();

    // 更新数据库
    const [data] = await prisma.$transaction([
      prisma.image.create({
        data: {
          created_at: now,
          created_by: event.context.user.id,
          tags: tagArray,
          folder_id: folder.id,
          width: metadata.width ?? 100,
          height: metadata.height ?? 100,
          size: metadata.size ?? 0,
          format,
          hash: imageHash,
          preview: previewHash,
        },
      }),
      prisma.imageFolder.update({
        where: { id: folder.id },
        data: {
          size: folder.size + (metadata.size ?? 0),
          count: folder.count + 1,
          cover: `${imageHash}.${format}`,
        },
      }),
    ]);

    return getOKResponse(event, data);
  }

  return getOKResponse(event, exist);
});
