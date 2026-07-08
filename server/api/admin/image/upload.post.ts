import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { uploadImage } from "@@/server/utils/image-upload";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";

/**
 * 上传图片
 * 1. 检查图片格式
 * 2. 同一文件只保存一次（可有多条记录）
 * 3. 需要生成预览图，以优化性能
 */

export default defineEventHandler(async (event) => {
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
  const result = await uploadImage({
    folderId: folder.id,
    file,
    tags: tagArray,
    actor: {
      createdBy: event.context.user.id,
      updatedBy: event.context.user.id
    }
  });

  if (!result) {
    return getBadResponse(event, "目录不存在");
  }

  return getOKResponse(event, {
    ...result.image,
    hash: result.asset.hash,
    height: result.asset.height,
    width: result.asset.width,
    size: result.asset.size,
    format: result.asset.ext,
    preview: result.asset.preview
  });
});
