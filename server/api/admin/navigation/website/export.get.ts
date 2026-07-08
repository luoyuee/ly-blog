import { prisma } from "@@/server/db";

/**
 * 导出导航网站数据，结构与导入接口保持一致，便于二次导入。
 *
 * 导出字段：name、url、icon、tags、description、type、hot、is_favorite、is_public、status
 * 不导出 id 及审计字段（created_at、created_by、updated_at、updated_by）。
 */
export default defineEventHandler(async (event) => {
  const results = await prisma.navigationWebsite.findMany({
    where: {
      status: { not: 0 }
    },
    select: {
      name: true,
      url: true,
      icon: true,
      tags: true,
      description: true,
      type: true,
      hot: true,
      is_favorite: true,
      is_public: true,
      status: true
    },
    orderBy: [{ is_favorite: "desc" }, { hot: "desc" }, { id: "desc" }]
  });

  event.node.res.setHeader("Content-Type", "application/json; charset=utf-8");

  return JSON.stringify(results, null, 2);
});
