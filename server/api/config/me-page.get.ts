import { getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { DefaultMePageConfig } from "@@/shared/constants/default-configs";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.ME_PAGE }
  });

  if (config) {
    return getOKResponse(event, config.data);
  }

  return getOKResponse(event, DefaultMePageConfig);
});
