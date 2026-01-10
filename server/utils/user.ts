import type { UserAvatarFormat } from "#shared/types";
import type { FileTypeResult } from "file-type";
import { fileTypeFromBuffer } from "file-type";
import { existsSync, mkdirSync } from "fs";
import { prisma } from "@@/server/db";
import config from "@@/server/config";
import { ImageFolderEnum } from "#shared/enums";
import CryptoJS from "crypto-js";
import sharp from "sharp";

const avatarWidth = 120;
const avatarHeight = 120;

export const handleUserAvatar = async (file: File): Promise<string> => {
  const rawBuffer = await file.arrayBuffer();

  const fileType: FileTypeResult | undefined = await fileTypeFromBuffer(rawBuffer);

  if (fileType === undefined) {
    return Promise.reject("不支持此格式");
  }

  let transformer = sharp(rawBuffer);
  const format: UserAvatarFormat = "webp";

  switch (fileType.ext as string) {
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      transformer = transformer
        .webp({
          quality: 100
        })
        .resize({
          width: avatarWidth,
          height: avatarHeight,
          fit: "fill"
        });
      break;
    default:
      return Promise.reject("不支持此格式");
  }

  const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(await transformer.toBuffer())).toString();

  if (!existsSync(config.IMAGE_FOLDER_PATH))
    mkdirSync(config.IMAGE_FOLDER_PATH, { recursive: true });
  if (!existsSync(config.IMAGE_PREVIEW_FOLDER_PATH))
    mkdirSync(config.IMAGE_PREVIEW_FOLDER_PATH, { recursive: true });

  const exist = await prisma.image.findFirst({
    where: { hash, folder_id: ImageFolderEnum.SYSTEM }
  });

  if (exist === null) {
    const imagePath = `${config.IMAGE_FOLDER_PATH}/${hash}.${format}`;
    const previewPath = `${config.IMAGE_PREVIEW_FOLDER_PATH}/${hash}.${format}`;

    if (!existsSync(imagePath)) {
      transformer.toFile(imagePath);
    }

    if (!existsSync(previewPath)) {
      transformer.webp({ quality: 20 }).toFile(previewPath);
    }

    const metadata = await transformer.metadata();

    await prisma.image.create({
      data: {
        created_at: new Date(),
        created_by: 0,
        tags: [],
        folder_id: ImageFolderEnum.SYSTEM,
        width: avatarWidth,
        height: avatarHeight,
        size: metadata.size ?? 0,
        format,
        hash
      }
    });

    const folder = await prisma.imageFolder.findUnique({
      where: { id: ImageFolderEnum.SYSTEM }
    });

    if (folder === null) {
      return Promise.reject("System image folder not found");
    }

    await prisma.imageFolder.update({
      where: { id: ImageFolderEnum.SYSTEM },
      data: {
        size: folder.size + (metadata.size ?? 0),
        count: folder.count + 1,
        cover: `${hash}.${format}`
      }
    });
  }

  return `/api/image/${hash}`;
};
