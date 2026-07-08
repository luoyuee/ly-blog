import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const folders = await prisma.fileFolder.findMany({
    where: {
      status: 1
    },
    orderBy: {
      id: "desc"
    }
  });

  return getOKResponse(event, folders);
});
