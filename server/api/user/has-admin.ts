import { getOKResponse } from "@@/server/utils/response";
import { UserRoleEnum } from "#shared/enums";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  const user = await prisma.user.findFirst({
    where: {
      status: 1,
      role: UserRoleEnum.ADMIN
    }
  });

  if (user) {
    return getOKResponse(event, { has_admin: true });
  } else {
    return getOKResponse(event, { has_admin: false });
  }
});
