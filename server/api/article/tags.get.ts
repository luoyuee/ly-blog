import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineCachedEventHandler(
  async (event) => {
    const result = await prisma.article.findMany({
      select: {
        tags: true
      },
      where: { status: 1 }
    });
    const tagMap: Record<string, number> = {};

    result.forEach((item) => {
      const tags: string[] | null = item.tags as string[] | null;

      if (!tags) return;

      tags.forEach((tag) => {
        if (tagMap[tag]) {
          tagMap[tag] += 1;
        } else {
          tagMap[tag] = 1;
        }
      });
    });

    return getOKResponse(event, Object.keys(tagMap));
  },
  { maxAge: 60 }
);
