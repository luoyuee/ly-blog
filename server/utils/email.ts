import type { IServerConfig, IServerConfigMailer, IClientConfig } from "@@/shared/types/config";
import type { Attachment } from "nodemailer/lib/mailer";
import { ConfigNameEnum } from "@@/shared/enums";
import { prisma } from "@@/server/db";
import { z } from "zod";
import nodemailer from "nodemailer";

export const logoBase64 = `data:image/png;base64,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`;

export const template = `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Microsoft YaHei", Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f7fa;
        padding: 20px 0;
      }

      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .email-header {
        background-color: #0052d9;
        padding: 20px 30px;
        text-align: center;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 700;
      }

      .email-header img {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .email-content {
        padding: 20px 30px;
      }

      .email-title {
        font-size: 20px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 20px;
      }

      .email-footer {
        background-color: #f7f9fc;
        padding: 20px 30px;
        text-align: center;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #e8e8e8;
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        justify-content: center;
      }

      .email-footer-copyright {
        color: #999;
        font-size: 12px;
      }

      .footer-links a {
        color: #666;
        text-decoration: none;
        margin: 0 8px;
      }

      .footer-links a:hover {
        color: #0052d9;
      }

      @media screen and (max-width: 600px) {
        .email-container {
          border-radius: 0;
        }

        .email-header,
        .email-content,
        .email-footer {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <img src="${logoBase64}" alt="logo" />
        Blog
      </div>

      <div class="email-content">
        <h1 class="email-title">{{subject}}</h1>
        {{content}}
      </div>

      <div class="email-footer">
        <p>本邮件由 LY-Blog 系统自动发送，请勿直接回复。</p>

        <div class="footer-links">
          <a href="{{url}}">博客首页</a> |
          <a href="{{aboutUrl}}">关于我们</a> |
          <a href="{{contactUrl}}">联系我们</a>
        </div>

        <p class="email-footer-copyright">{{copyright}}</p>
      </div>
    </div>
  </body>
</html>
`;

type MailerConfig = Required<Pick<IServerConfigMailer, "host" | "port" | "user" | "pass">> &
  Omit<IServerConfigMailer, "host" | "port" | "user" | "pass">;

interface SiteInfo {
  title: string;
  url: string;
  createAt: Date;
}

const mailerConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  tls: z.boolean().optional(),
  user: z.string(),
  pass: z.string(),
  notif_email: z.email().optional(),
  enable_comment_notif: z.boolean().optional(),
  enable: z.boolean().optional()
});

export const useEmail = (config?: { mailer?: MailerConfig }) => {
  let transporter: nodemailer.Transporter | undefined = undefined;

  let mailerConfig: MailerConfig | undefined = config?.mailer;

  const siteInfo: SiteInfo = {
    title: "LY-Blog",
    url: "http://localhost:3000",
    createAt: new Date()
  };

  const initTransporter = async () => {
    const clientConfig = await prisma.config.findUnique({
      where: { name: ConfigNameEnum.CLIENT }
    });

    if (clientConfig) {
      const basic = (clientConfig.data as unknown as IClientConfig).basic;
      if (basic.title) siteInfo.title = basic.title;
      if (basic.site_url) siteInfo.url = basic.site_url;
      if (clientConfig.created_at) siteInfo.createAt = clientConfig.created_at;
    }

    if (mailerConfig) {
      const { data, error } = mailerConfigSchema.safeParse(mailerConfig);

      if (error) {
        throw new Error("Email config is invalid");
      }

      mailerConfig = data;
    } else {
      const serverConfig = await prisma.config.findUnique({
        where: { name: ConfigNameEnum.SERVER }
      });

      if (!serverConfig) {
        throw new Error("Email config not found");
      }

      const { data, error } = mailerConfigSchema.safeParse(
        (serverConfig.data as unknown as IServerConfig).mailer
      );

      if (error) {
        throw new Error("Email config is invalid");
      }

      mailerConfig = data;
    }

    transporter = nodemailer.createTransport({
      host: mailerConfig?.host,
      port: mailerConfig?.port,
      secure: mailerConfig?.tls,
      auth: {
        user: mailerConfig?.user,
        pass: mailerConfig?.pass
      }
    });
  };

  const sendEmail = async (options: {
    to: string | string[];
    subject: string;
    content: string;
    attachments?: Attachment[];
  }) => {
    if (!transporter || !mailerConfig) {
      throw new Error("Transporter not initialized");
    }

    const html = template
      .replace("{{title}}", `${siteInfo.title} - 邮件通知`)
      .replace("{{subject}}", options.subject)
      .replace("{{content}}", options.content)
      .replace("{{url}}", siteInfo.url)
      .replace("{{aboutUrl}}", `${siteInfo.url}/about`)
      .replace("{{contactUrl}}", `${siteInfo.url}/contact`)
      .replace(
        "{{copyright}}",
        `Copyright © ${siteInfo.createAt.getFullYear()} - ${new Date().getFullYear()} ${siteInfo.title} 版权所有 `
      );

    await transporter.sendMail({
      from: {
        name: siteInfo.title,
        address: mailerConfig.user
      },
      to: options.to,
      subject: options.subject,
      html,
      attachments: options.attachments
    });
  };

  const sendNotification = async (options: {
    to: string | string[];
    subject: string;
    content: string;
  }) => {
    if (mailerConfig?.enable) {
      await sendEmail({
        to: options.to,
        subject: options.subject,
        content: options.content
      });
    }
  };

  const sendCommentNotifEmail = async (options: {
    to: string | string[];
    subject: string;
    content: string;
  }) => {
    if (mailerConfig?.enable_comment_notif) {
      await sendEmail({
        to: options.to,
        subject: options.subject,
        content: options.content
      });
    }
  };

  return {
    initTransporter,
    sendEmail,
    sendNotification,
    sendCommentNotifEmail
  };
};
