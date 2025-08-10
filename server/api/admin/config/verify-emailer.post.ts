import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { readBody } from "h3";
import { z } from "zod";
import nodemailer from "nodemailer";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    host: z.string(),
    port: z.number(),
    tls: z.boolean(),
    user: z.string().email(),
    pass: z.string(),
    notif_email: z.string().email(),
  });

  const { error, data: body } = zodSchema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const transporter = nodemailer.createTransport({
    host: body.host,
    port: body.port,
    secure: body.tls,
    auth: {
      user: body.user,
      pass: body.pass,
    },
  });

  const mailOptions = {
    from: `"LY-Blog" <${body.user}>`,
    to: body.notif_email,
    subject: "测试邮件",
    html: "<b>这是一条测试邮件系统的通知信息</b>",
  };

  const sendMail = () => {
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve("ok");
        }
      });
    });
  };

  try {
    await sendMail();
    return getOKResponse(event);
  } catch (error) {
    return getBadResponse(event, (error as Error).message);
  }
});
