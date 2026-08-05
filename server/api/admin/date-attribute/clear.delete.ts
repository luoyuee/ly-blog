import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

/** 清空全部日期拓展数据。 */
export default defineEventHandler(async (event) => {
  const result = await prisma.dateAttribute.deleteMany();

  return getOKResponse(event, { count: result.count });
});
