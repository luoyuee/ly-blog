import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const startTime = dayjs().subtract(7, "d").startOf("d");

  const result = await prisma.dashboard.findMany({
    where: {
      time: {
        gte: startTime.toDate()
      }
    },
    orderBy: {
      time: "asc"
    }
  });

  const article = await prisma.article.findMany({
    where: { status: 1 },
    select: {
      view_count: true
    }
  });

  const total = article.reduce((sum, item) => {
    sum += item.view_count;
    return sum;
  }, 0);

  let todayView = 0;
  const x: string[] = [];
  const y: number[] = [];

  const today = dayjs().startOf("d");

  if (result) {
    result.forEach((item) => {
      const dailyStats = item.data as unknown as DailyStatistics;

      Object.keys(dailyStats.hourlyRequests).forEach((key) => {
        const k = dayjs(item.time).add(Number(key), "h").format("YYYY-MM-DD HH:mm:ss");
        x.push(k);
        y.push(dailyStats.hourlyRequests[key].article);
      });

      if (dayjs(item.time).isSame(today, "d")) {
        todayView += dailyStats.totalRequests.article;
      }
    });
  }

  return getOKResponse(event, {
    total,
    x,
    y,
    today: todayView
  });
});
