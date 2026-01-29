import { getOKResponse, getBadResponse, getForbiddenResponse } from "@@/server/utils/response";
import { handleUserAvatar } from "@@/server/utils/image";
import { UserRoleEnum } from "#shared/enums";
import { readFormData } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import CryptoJS from "crypto-js";

export default defineEventHandler(async (event) => {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        status: 1,
        role: UserRoleEnum.ADMIN
      }
    });

    if (admin !== null) return getForbiddenResponse(event);

    const formData = await readFormData(event);
    const avatar = formData.get("avatar");
    const nickname = formData.get("nickname");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    const schema = z.object({
      nickname: z.string(),
      username: z.string(),
      email: z.email(),
      password: z.string().min(6)
    });

    const { error, data: validForm } = schema.safeParse({
      nickname,
      username,
      email,
      password
    });

    if (error) return getBadResponse(event, error.message);

    // 处理用户头像
    let userAvatar = "/images/avatar.webp";

    if (avatar) {
      userAvatar = await handleUserAvatar(avatar as File);
    }

    // 创建管理员
    await prisma.user.create({
      data: {
        created_at: new Date(),
        nickname: validForm.nickname,
        username: validForm.username,
        email: validForm.email,
        password: CryptoJS.MD5(validForm.password).toString(),
        role: UserRoleEnum.ADMIN,
        avatar: userAvatar
      }
    });

    return getOKResponse(event);
  } catch (error) {
    return getBadResponse(event, "注册失败：" + String(error));
  }
});
