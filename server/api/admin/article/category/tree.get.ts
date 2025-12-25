import type { ArticleCategoryTree } from "@@/shared/types/article";
import { getOKResponse } from "@@/server/utils/response";
import { toTree } from "@@/shared/utils/convert";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const data = await prisma.articleCategory.findMany({
    where: {
      status: 1
    },
    select: {
      id: true,
      parent_id: true,
      icon: true,
      name: true,
      description: true
    }
  });

  return getOKResponse(
    event,
    toTree(data, {
      idKey: "id",
      parentKey: "parent_id",
      childrenKey: "children"
    }) as ArticleCategoryTree
  );
});
