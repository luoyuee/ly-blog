import { useFileStorage } from "@@/server/utils/useFileStorage";
import { createReadStream } from "fs";
import { ImageFolderEnum } from "#shared/enums";
import { prisma } from "@@/server/db";
import mime from "mime/lite";

const getImages = defineCachedFunction(
  async (folder: number) => {
    const images = await prisma.image.findMany({
      where: { folder_id: folder },
      select: {
        id: true,
        hash: true,
        format: true
      }
    });

    return images.map((item) => ({
      id: item.id,
      hash: item.hash,
      format: item.format
    }));
  },
  {
    maxAge: 60 // 缓存60秒
  }
);

export default defineEventHandler(async (event) => {
  const images = await getImages(ImageFolderEnum.BACKGROUND);

  event.node.res.setHeader("Cache-Control", "no-cache");

  if (images.length > 0) {
    const index = Math.floor(Math.random() * images.length);
    const img = images[index];

    const fileStorage = useFileStorage();
    const filename = `${img.hash}.${img.format}`;

    const filePath = await fileStorage.getPath(filename);

    if (await fileStorage.exists(filename)) {
      event.node.res.setHeader("Content-Type", mime.getType(img.format) ?? "image/webp");

      return createReadStream(filePath);
    }
  }

  // 默认背景图片
  event.node.res.setHeader("Content-Type", "image/webp");
  // 重定向到默认背景图片
  sendRedirect(event, "/images/default_bg.webp", 302);
});
