import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const notes = await prisma.note.findMany({
    where: { status: 1 },
    select: {
      id: true,
      created_at: true,
      content_updated_at: true,
      folder_id: true
    }
  });

  const folders = await prisma.noteFolder.findMany({
    where: { status: 1 },
    select: {
      id: true,
      name: true
    }
  });

  const folderMap: Record<number, { name: string; count: number }> = {};

  let todayCreated = 0;
  let todayUpdated = 0;
  let other = 0;

  const todayStart = dayjs().startOf("d");

  folders.forEach((item) => {
    folderMap[item.id] = {
      name: item.name,
      count: 0
    };
  });

  notes.forEach((item) => {
    if (item.created_at && dayjs(item.created_at).isAfter(todayStart)) {
      todayCreated += 1;
    }

    if (item.content_updated_at && dayjs(item.content_updated_at).isAfter(todayStart)) {
      todayUpdated += 1;
    }

    if (item.folder_id && folderMap[item.folder_id]) {
      folderMap[item.folder_id].count += 1;
    } else {
      other += 1;
    }
  });

  const x: string[] = [];
  const y: number[] = [];

  Object.values(folderMap).forEach((item) => {
    x.push(item.name);
    y.push(item.count);
  });

  x.push("根目录");
  y.push(other);

  return getOKResponse(event, {
    total: notes.length,
    x,
    y,
    today_created: todayCreated,
    today_updated: todayUpdated
  });
});
