import { getNotAuthResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";

export default defineEventHandler(async (event) => {
  if (event.context.user && event.context.user.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: event.context.user.id,
      },
    });
    if (user) {
      return getOKResponse(event, {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      });
    }
  }

  return getNotAuthResponse(event);
});
