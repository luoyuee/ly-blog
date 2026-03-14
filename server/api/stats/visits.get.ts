import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const result = await prisma.dashboard.findMany({});

  const stats = {
    api: 0,
    page: 0,
    static: 0
  };

  if (result) {
    result.forEach((item) => {
      const dailyStats = item.data as unknown as DailyStatistics;

      stats.api += dailyStats.totalRequests.api;
      stats.page += dailyStats.totalRequests.page;
      stats.static += dailyStats.totalRequests.static;
    });
  }

  return getOKResponse(event, stats);
});
