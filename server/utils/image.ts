import type { PluginConfig } from "svgo";
import type { FitEnum, Metadata } from "sharp";
import { useFileStorage } from "./useFileStorage";
import { ImageFolderEnum } from "#shared/enums";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@@/server/db";
import { optimize } from "svgo";
import chroma from "chroma-js";
import sharp from "sharp";

export interface OptimizeOptions {
  size?: {
    width: number;
    height: number;
  };
  quality?: number;
  fit?: keyof FitEnum;
}

export interface OptimizeResult {
  content: Buffer;
  metadata: Metadata;
  format: string;
}

type BinaryLike = Buffer | ArrayBuffer | ArrayBufferView;

/**
 * 将多种二进制数据类型统一转换为 Buffer
 */
const toBuffer = (data: BinaryLike): Buffer => {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }

  return Buffer.from(data);
};

export async function optimizeImage(
  content: BinaryLike,
  config?: OptimizeOptions
): Promise<OptimizeResult> {
  const buffer = toBuffer(content);

  // 判断文件类型
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    throw new Error("不支持此格式");
  }

  switch (fileType.ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
    case "raw": {
      let transformer = sharp(buffer).webp({
        quality: config?.quality ?? 100
      });

      if (config?.size) {
        transformer = transformer.resize(config.size.width, config.size.height, {
          fit: config.fit ?? "fill"
        });
      }

      return {
        content: await transformer.toBuffer(),
        format: "webp",
        metadata: await transformer.metadata()
      };
    }

    case "gif": {
      let transformer = sharp(buffer, { animated: true });

      if (config?.size) {
        transformer = transformer.resize(config.size.width, config.size.height, {
          fit: config.fit ?? "fill"
        });
      }

      return {
        content: await transformer.toBuffer(),
        format: "gif",
        metadata: await transformer.metadata()
      };
    }
    case "xml": {
      let plugins: PluginConfig[] = ["preset-default", "sortAttrs"];

      if (config?.size) {
        plugins = [
          ...plugins,
          "removeDimensions", // 移除原有尺寸属性
          {
            name: "addAttributesToSVGElement",
            params: {
              attributes: [
                { width: String(config.size?.width || 24) },
                { height: String(config.size?.height || 24) }
              ]
            }
          }
        ];
      }
      const result = optimize(buffer.toString(), {
        plugins
      });

      const resultBuffer = Buffer.from(result.data);

      return {
        content: resultBuffer,
        format: "svg",
        metadata: await sharp(resultBuffer).metadata()
      };
    }
    default:
      throw new Error("不支持此格式");
  }
}

const avatarWidth = 120;
const avatarHeight = 120;

export const handleUserAvatar = async (file: File): Promise<string> => {
  const fileStorage = useFileStorage();

  const rawBuffer = await file.arrayBuffer();

  const optimized = await optimizeImage(rawBuffer, {
    size: {
      width: avatarWidth,
      height: avatarHeight
    }
  });

  const hash = fileStorage.getHash(optimized.content);

  const exist = await prisma.image.findFirst({
    where: { hash, folder_id: ImageFolderEnum.SYSTEM }
  });

  if (exist === null) {
    const preview = await optimizeImage(optimized.content, {
      quality: 20
    });

    const previewHash = fileStorage.getHash(preview.content);

    fileStorage.save(optimized.content, optimized.format);
    fileStorage.save(preview.content, preview.format);

    const optimizedSize = fileStorage.getSize(optimized.content);

    await prisma.image.create({
      data: {
        created_at: new Date(),
        created_by: 0,
        tags: [],
        hash,
        folder_id: ImageFolderEnum.SYSTEM,
        width: avatarWidth,
        height: avatarHeight,
        size: optimizedSize,
        format: optimized.format,
        preview: previewHash
      }
    });

    const folder = await prisma.imageFolder.findUnique({
      where: { id: ImageFolderEnum.SYSTEM }
    });

    if (folder === null) {
      throw new Error("System image folder not found");
    }

    await prisma.imageFolder.update({
      where: { id: ImageFolderEnum.SYSTEM },
      data: {
        size: folder.size + optimizedSize,
        count: folder.count + 1,
        cover: `${previewHash}.${preview.format}`
      }
    });
  }

  return `/api/image/${hash}`;
};

export const createPlaceholderImage = async (options?: {
  width?: number;
  height?: number;
  text?: string;
  bgColor?: string;
  fontColor?: string;
  fontSize?: number;
}): Promise<Buffer> => {
  const width = options?.width ?? 400;
  const height = options?.height ?? 200;
  const text = options?.text ?? "图片已被删除";
  const fallbackBgColor = "#f5f5f5";
  const fallbackFontColor = "#666";

  const resolveColor = (color: string | undefined, fallback: string): string => {
    const v = color?.trim();
    if (!v) return fallback;
    return chroma.valid(v) ? v : fallback;
  };

  const bgColor = resolveColor(options?.bgColor, fallbackBgColor);
  const fontColor = resolveColor(options?.fontColor, fallbackFontColor);

  const [bgR, bgG, bgB, bgAlpha] = chroma(bgColor).rgba();
  const channels = bgAlpha < 1 ? 4 : 3;
  const svgFill = chroma(fontColor).hex();

  return await sharp({
    create: {
      width,
      height,
      channels,
      background:
        channels === 4
          ? {
              r: bgR,
              g: bgG,
              b: bgB,
              alpha: bgAlpha
            }
          : { r: bgR, g: bgG, b: bgB }
    }
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}">
            <text
              x="50%"
              y="50%"
              font-size="${options?.fontSize ?? 24}"
              fill="${svgFill}"
              text-anchor="middle"
              dy=".3em"
            >
              ${text}
            </text>
          </svg>
        `),
        gravity: "center"
      }
    ])
    .png()
    .toBuffer();
};
