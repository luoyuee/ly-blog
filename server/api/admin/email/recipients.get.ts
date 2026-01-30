import type { Prisma } from "@@/prisma/generated/client";
import type { RecipientOption } from "@@/shared/types";
import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

/**
 * 文章评论基础类型
 */
type ArticleCommentBase = Prisma.ArticleCommentGetPayload<{
  select: {
    avatar: true;
    nickname: true;
    email: true;
    website: true;
  };
}>;

/**
 * 留言板基础类型
 */
type MessageBoardBase = Prisma.MessageBoardGetPayload<{
  select: {
    avatar: true;
    nickname: true;
    email: true;
    website: true;
  };
}>;

export default defineEventHandler(async (event) => {
  /**
   * 并行查询文章评论与留言板中的邮箱数据
   */
  const [articleComments, messageBoards] = await Promise.all([
    prisma.articleComment.findMany({
      select: {
        avatar: true,
        nickname: true,
        email: true,
        website: true
      },
      where: { status: 1 },
      orderBy: {
        created_at: "desc"
      }
    }),
    prisma.messageBoard.findMany({
      select: {
        avatar: true,
        nickname: true,
        email: true,
        website: true
      },
      where: { status: 1 },
      orderBy: {
        created_at: "desc"
      }
    })
  ]);

  /**
   * 合并并去重：
   * 去重规则：
   * - 以邮箱作为唯一键
   * - 如果多条记录邮箱相同，则优先保留有头像与网站信息的记录
   */
  const map = new Map<string, RecipientOption>();

  const mergeItem = (item: ArticleCommentBase | MessageBoardBase): void => {
    const email = item.email.trim().toLowerCase();

    if (!email) return;

    const existing = map.get(email);

    const current: RecipientOption = {
      avatar: item.avatar,
      nickname: item.nickname,
      email: item.email,
      website: item.website
    };

    if (!existing) {
      map.set(email, current);
      return;
    }

    map.set(email, {
      avatar: existing.avatar || current.avatar,
      nickname: existing.nickname || current.nickname,
      email: existing.email,
      website: existing.website || current.website
    });
  };

  articleComments.forEach((item) => mergeItem(item));
  messageBoards.forEach((item) => mergeItem(item));

  const data = Array.from(map.values());

  return getOKResponse(event, data);
});
