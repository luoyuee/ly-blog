import { getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.WORK }
  });

  if (config) {
    return getOKResponse(event, config.data);
  } else {
    return getOKResponse(event, []);
  }
});
