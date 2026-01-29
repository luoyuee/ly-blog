import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const startTime = dayjs().subtract(7, "d").startOf("d");
  const endTime = dayjs().add(1, "h").startOf("h");

  const durationn = Math.floor((endTime.unix() - startTime.unix()) / 3600);

  const data: Record<
    string,
    {
      api: number;
      page: number;
      static: number;
    }
  > = {};

  for (let i = 0; i <= durationn; i++) {
    const time = startTime.add(i, "h").startOf("h").format("YYYY-MM-DD HH:mm:ss");

    data[time] = {
      api: 0,
      page: 0,
      static: 0
    };
  }

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

  if (result) {
    result.forEach((item) => {
      const dailyStats = item.data as unknown as DailyStatistics;

      Object.keys(dailyStats.hourlyRequests).forEach((key) => {
        const k = dayjs(item.time).add(Number(key), "h").format("YYYY-MM-DD HH:mm:ss");

        if (data[k]) {
          data[k].api += dailyStats.hourlyRequests[key].api;
          data[k].page += dailyStats.hourlyRequests[key].page;
          data[k].static += dailyStats.hourlyRequests[key].static;
        }
      });
    });
  }

  const x: string[] = [];
  const apiReq: number[] = [];
  const pageReq: number[] = [];
  const staticReq: number[] = [];

  Object.keys(data).forEach((key) => {
    x.push(dayjs(key).format("MM-DD HH:mm"));
    apiReq.push(data[key].api);
    pageReq.push(data[key].page);
    staticReq.push(data[key].static);
  });

  return getOKResponse(event, {
    x,
    series: [apiReq, pageReq, staticReq]
  });
});
