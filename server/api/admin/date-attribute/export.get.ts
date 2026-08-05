import { prisma } from "@@/server/db";

/** 按日期键导出全部日期拓展数据。 */
export default defineEventHandler(async (event) => {
  const records = await prisma.dateAttribute.findMany({
    select: {
      year: true,
      month: true,
      day: true,
      extra: true
    },
    orderBy: [{ year: "asc" }, { month: "asc" }, { day: "asc" }]
  });

  const result = Object.fromEntries(
    records.map((record) => {
      const key = [record.year, record.month, record.day]
        .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, "0")))
        .join("-");

      return [key, record.extra];
    })
  );

  event.node.res.setHeader("Content-Type", "application/json; charset=utf-8");
  event.node.res.setHeader("Content-Disposition", 'attachment; filename="date-attributes.json"');

  return JSON.stringify(result, null, 2);
});
