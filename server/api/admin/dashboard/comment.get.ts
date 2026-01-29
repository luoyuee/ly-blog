import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const total = await prisma.articleComment.count({
    where: { status: 1 }
  });

  const startTime = dayjs().subtract(7, "d").startOf("d");
  const endTime = dayjs().add(1, "h").startOf("h");

  const comments = await prisma.articleComment.findMany({
    where: {
      status: 1,
      created_at: {
        gte: startTime.toDate()
      }
    },
    select: {
      created_at: true
    }
  });

  const data: Record<string, number> = {};

  const durationn = Math.floor((endTime.unix() - startTime.unix()) / 3600);

  for (let i = 0; i <= durationn; i++) {
    const time = startTime.add(i, "h").startOf("h").format("YYYY-MM-DD HH:mm:ss");

    data[time] = 0;
  }

  let todayComment = 0;
  const now = dayjs();

  comments.forEach((item) => {
    if (item.created_at) {
      const time = dayjs(item.created_at).startOf("h");

      if (now.isSame(time, "day")) {
        todayComment += 1;
      }

      const key = time.format("YYYY-MM-DD HH:mm:ss");

      if (data[key]) {
        data[key] += 1;
      } else {
        data[key] = 1;
      }
    }
  });

  const x: string[] = [];
  const y: number[] = [];

  for (const key in data) {
    x.push(key);
    y.push(data[key]);
  }

  return getOKResponse(event, {
    total,
    x,
    y,
    today: todayComment
  });
});
