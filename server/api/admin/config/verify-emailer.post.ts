import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { useEmail } from "@@/server/utils/email";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    host: z.string(),
    port: z.number(),
    tls: z.boolean(),
    user: z.email(),
    pass: z.string(),
    notif_email: z.email()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const { initTransporter, sendEmail } = useEmail({
    mailer: {
      host: body.host,
      port: body.port,
      tls: body.tls,
      user: body.user,
      pass: body.pass
    }
  });

  try {
    await initTransporter();

    await sendEmail({
      to: body.notif_email,
      subject: "测试邮件",
      content: "这是一条测试邮件系统的通知信息"
    });

    return getOKResponse(event);
  } catch (error) {
    return getBadResponse(event, (error as Error).message);
  }
});
