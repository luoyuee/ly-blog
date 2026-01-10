import { getNotAuthResponse, getOKResponse } from "@@/server/utils/response";
import { UserRoleEnum } from "@@/shared/enums";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  if (event.context.user && event.context.user.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: event.context.user.id
      }
    });
    if (user) {
      return getOKResponse(event, {
        nickname: user.nickname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_time: user.last_login_at,
        last_login_ip: user.last_login_ip,
        last_login_location: user.last_login_location,
        is_admin: user.role === UserRoleEnum.ADMIN
      });
    }
  }

  return getNotAuthResponse(event);
});
