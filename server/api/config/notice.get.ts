import { EmptyNoticeConfig } from "#shared/constants";
import { getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "#shared/enums";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.NOTICE }
  });

  if (config) {
    return getOKResponse(event, config.data);
  }

  return getOKResponse(event, EmptyNoticeConfig);
});
