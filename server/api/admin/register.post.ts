import type { UserAvatarFormat } from "#shared/types";
import type { FileTypeResult } from "file-type";
import { ImageFolderEnum, UserRoleEnum } from "#shared/enums";
import { fileTypeFromBuffer } from "file-type";
import { existsSync, mkdirSync } from "fs";
import { readFormData } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import {
  getOKResponse,
  getBadResponse,
  getForbiddenResponse,
} from "@@/server/utils/response";
import config from "@@/server/config";
import CryptoJS from "crypto-js";
import sharp from "sharp";

const avatarWidth = 120;
const avatarHeight = 120;

const handleUserAvatar = async (file: File): Promise<string> => {
  // 原始数据
  const rawBuffer = await file.arrayBuffer();

  // 判断文件类型
  const fileType: FileTypeResult | undefined = await fileTypeFromBuffer(
    rawBuffer
  );

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
          quality: 100,
        })
        .resize({
          width: avatarWidth,
          height: avatarHeight,
          fit: "fill",
        });
      break;
    default:
      return Promise.reject("不支持此格式");
  }

  const hash = CryptoJS.MD5(
    CryptoJS.lib.WordArray.create(await transformer.toBuffer())
  ).toString();

  // 检查图片目录文件夹是否存在
  const imageFolder = `${config.IMAGE_FOLDER_PATH}`;
  const previewFolder = `${config.IMAGE_FOLDER_PATH}/preview`;

  if (!existsSync(imageFolder)) mkdirSync(imageFolder, { recursive: true });
  if (!existsSync(previewFolder)) mkdirSync(previewFolder, { recursive: true });

  // 查询图片是否已经存在
  const exist = await prisma.image.findFirst({
    where: { hash: hash, folder_id: ImageFolderEnum.SYSTEM },
  });

  if (exist === null) {
    const filePath = imageFolder + `/${hash}.${format}`;
    const previewPath = previewFolder + `/${hash}.${format}`;

    if (!existsSync(filePath)) {
      transformer.toFile(filePath);
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
        hash,
      },
    });

    const folder = await prisma.imageFolder.findUnique({
      where: { id: ImageFolderEnum.SYSTEM },
    });

    if (folder === null) {
      return Promise.reject("System image folder not found");
    }

    await prisma.imageFolder.update({
      where: { id: ImageFolderEnum.SYSTEM },
      data: {
        size: folder.size + (metadata.size ?? 0),
        count: folder.count + 1,
        cover: `${hash}.${format}`,
      },
    });
  }

  return `/api/image/${hash}`;
};

export default defineEventHandler(async (event) => {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        status: 1,
        role: UserRoleEnum.ADMIN,
      },
    });

    if (admin !== null) return getForbiddenResponse(event);

    const formData = await readFormData(event);
    const avatar = formData.get("avatar");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    const schema = z.object({
      username: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { error, data: validatedForm } = schema.safeParse({
      username,
      email,
      password,
    });

    if (error) return getBadResponse(event, error.message);

    // 处理用户头像
    let userAvatar = "/images/avatar.webp";

    if (avatar) {
      userAvatar = await handleUserAvatar(avatar as File);
    }

    // 创建管理员
    await prisma.user.create({
      data: {
        created_at: new Date(),
        username: validatedForm.username,
        email: validatedForm.email,
        password: CryptoJS.MD5(validatedForm.password).toString(),
        role: UserRoleEnum.ADMIN,
        avatar: userAvatar,
      },
    });

    return getOKResponse(event);
  } catch (error) {
    return getBadResponse(event, "注册失败：" + String(error));
  }
});
