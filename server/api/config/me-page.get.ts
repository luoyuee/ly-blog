import { getOKResponse } from "@@/server/utils/response";
import { DefaultMePageConfig } from "#shared/constants";
import { ConfigNameEnum } from "#shared/enums";
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
