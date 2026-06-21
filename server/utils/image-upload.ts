import { useFileStorage } from "@@/server/utils/useFileStorage";
import { optimizeImage } from "@@/server/utils/image";
import { prisma } from "@@/server/db";
import mime from "mime";

export type ImageUploadActor = {
  createdBy: number | null;
  updatedBy: number | null;
};

type ImageWithAsset = Awaited<ReturnType<typeof prisma.image.findFirst>> & {
  Asset: Awaited<ReturnType<typeof prisma.asset.findUnique>>;
};

export interface ImageUploadResult {
  image: NonNullable<ImageWithAsset>;
  asset: NonNullable<Awaited<ReturnType<typeof prisma.asset.findUnique>>>;
}

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
 * 统一处理图片上传、去重、预览图生成与数据库入库。
 */
export const uploadImage = async (params: {
  folderId: number;
  file: File;
  tags: string[];
  actor: ImageUploadActor;
}): Promise<ImageUploadResult | null> => {
  const fileStorage = useFileStorage();
  const folder = await prisma.imageFolder.findUnique({
    where: { id: params.folderId }
  });

  if (!folder) {
    return null;
  }

  const rawBuffer = await params.file.arrayBuffer();
  const optimized = await optimizeImage(rawBuffer);
  const imageHash = fileStorage.getHash(optimized.content);

  const existed = await prisma.image.findFirst({
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

  if (existed) {
    return {
      image: existed as NonNullable<ImageWithAsset>,
      asset: existed.Asset
    };
  }

  await fileStorage.save(optimized.content, optimized.format);

  const preview = await optimizeImage(optimized.content, {
    quality: 20
  });
  const previewHash = fileStorage.getHash(preview.content);

  await fileStorage.save(preview.content, preview.format);

  const now = new Date();
  const optimizedSize = fileStorage.getSize(optimized.content);
  const originalName = params.file.name || `${imageHash}.${optimized.format}`;
  const filename = await resolveImageFilename(folder.id, originalName);

  const asset = await prisma.asset.upsert({
    where: { hash: imageHash },
    create: {
      created_at: now,
      created_by: params.actor.createdBy,
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
      updated_by: params.actor.updatedBy,
      preview: previewHash,
      width: optimized.metadata.width ?? 100,
      height: optimized.metadata.height ?? 100
    }
  });

  const [image] = await prisma.$transaction([
    prisma.image.create({
      data: {
        created_at: now,
        created_by: params.actor.createdBy,
        tags: params.tags,
        folder_id: folder.id,
        asset_id: asset.id,
        original_name: originalName,
        filename
      },
      include: {
        Asset: true
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

  return {
    image: image as NonNullable<ImageWithAsset>,
    asset
  };
};
