import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const folders = await prisma.imageFolder.findMany({
    omit: {
      status: true,
    },
  });

  return getOKResponse(event, folders);
});
