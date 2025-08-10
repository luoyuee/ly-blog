import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getRouterParam } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z
    .number({ coerce: true })
    .int()
    .safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const comment = await prisma.articleComment.findUnique({
    where: { id },
    select: {
      id: true,
      article_id: true,
    },
  });

  if (!comment) return getOKResponse(event);

  await prisma.$transaction(async (t) => {
    await t.articleComment.update({ where: { id }, data: { status: 0 } });

    const count = await t.articleComment.count({
      where: { article_id: comment.article_id, status: 1 },
    });

    t.article.update({
      where: { id: comment.article_id },
      data: {
        comment_count: count,
      },
    });
  });

  return getOKResponse(event);
});
