import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineCachedEventHandler(
  async (event) => {
    const articles = await prisma.article.findMany({
      where: { status: 1 },
      select: {
        id: true,
        comment_count: true,
        tags: true,
      },
    });

    const tagMap: Record<string, number> = {};
    let likeCount = 0;
    let articleCount = 0;

    articles.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: any) => {
          if (tagMap[tag]) {
            tagMap[tag] += 1;
          } else {
            tagMap[tag] = 1;
          }
        });
      }
      likeCount += item.comment_count ?? 0;
      articleCount++;
    });

    return getOKResponse(event, {
      article_count: articleCount,
      like_count: likeCount,
      tag_count: tagMap.length,
    });
  },
  { maxAge: 60 }
);
