import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const articles = await prisma.article.findMany({
    where: { status: 1 },
    select: { id: true, created_at: true, content_updated_at: true, category_id: true }
  });

  const categories = await prisma.articleCategory.findMany({
    where: { status: 1 },
    select: { id: true, name: true }
  });

  const categoryMap: Record<number, { name: string; count: number }> = {};

  let todayCreated = 0;
  let todayUpdated = 0;
  let other = 0;

  const todayStart = dayjs().startOf("d");

  categories.forEach((item) => {
    categoryMap[item.id] = {
      name: item.name,
      count: 0
    };
  });

  articles.forEach((item) => {
    if (item.created_at && dayjs(item.created_at).isAfter(todayStart)) {
      todayCreated += 1;
    }

    if (item.content_updated_at && dayjs(item.content_updated_at).isAfter(todayStart)) {
      todayUpdated += 1;
    }

    if (item.category_id && categoryMap[item.category_id]) {
      categoryMap[item.category_id].count += 1;
    } else {
      other += 1;
    }
  });

  const x: string[] = [];
  const y: number[] = [];

  Object.values(categoryMap).forEach((item) => {
    x.push(item.name);
    y.push(item.count);
  });

  x.push("未分类");
  y.push(other);

  return getOKResponse(event, {
    total: articles.length,
    x,
    y,
    today_created: todayCreated,
    today_updated: todayUpdated
  });
});
