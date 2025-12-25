import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

const configName = "client";

export default defineEventHandler(async (event) => {
  const config = await prisma.config.findUnique({
    where: { name: configName },
  });

  if (config) {
    return getOKResponse(event, config.data);
  } else {
    return getBadResponse(event);
  }
});
