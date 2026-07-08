import { prisma } from "@@/server/db";

/**
 * 导出一言数据，结构与导入接口保持一致，便于二次导入。
 */
export default defineEventHandler(async (event) => {
  const results = await prisma.hitokoto.findMany({
    select: {
      type: true,
      source: true,
      author: true,
      content: true
    },
    orderBy: {
      id: "desc"
    }
  });

  event.node.res.setHeader("Content-Type", "application/json; charset=utf-8");

  return JSON.stringify(results, null, 2);
});
