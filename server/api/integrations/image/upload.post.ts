import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { requireApiKeyScope } from "@@/server/utils/auth/api-key";
import { uploadImage } from "@@/server/utils/image-upload";
import { ApiKeyScopeEnum } from "#shared/enums";
import { readFormData } from "h3";

/**
 * 提供给外部集成使用的图片上传接口。
 */
export default defineEventHandler(async (event) => {
  requireApiKeyScope(event, ApiKeyScopeEnum.IMAGE_UPLOAD);

  const formData = await readFormData(event);

  const folderID = formData.get("folder");
  if (!folderID || typeof folderID !== "string") {
    return getBadResponse(event, "缺少目录ID");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return getBadResponse(event, "缺少图片数据");
  }

  const tags = formData.get("tags");
  const tagArray = typeof tags === "string" ? tags.split(",") : [];

  const result = await uploadImage({
    folderId: Number(folderID),
    file,
    tags: tagArray,
    actor: {
      createdBy: null,
      updatedBy: null
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
