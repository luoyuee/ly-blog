import { prisma } from "@@/server/db";
import { getOKResponse } from "@@/server/utils/response";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const todayUpload = await prisma.image.count({
    where: {
      created_at: {
        gte: dayjs().startOf("d").toDate()
      }
    }
  });

  const folders = await prisma.imageFolder.findMany({
    select: {
      id: true,
      name: true,
      count: true,
      size: true
    }
  });

  let total = 0;
  let storageSize = 0;
  const x: string[] = [];
  const y: number[] = [];
  const y2: number[] = [];

  folders.forEach((item) => {
    x.push(item.name);
    y.push(item.count);
    y2.push(parseFloat((item.size / 1024 / 1024).toFixed(2)));
    storageSize += item.size;
    total += item.count;
  });

  return getOKResponse(event, {
    total,
    x,
    series: [y, y2],
    storage_size: storageSize,
    today_upload: todayUpload
  });
});
