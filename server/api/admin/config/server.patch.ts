import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    created_at: z.number().optional().nullable(),
    updated_at: z.number().optional().nullable(),

    mailer: z.object({
      host: z.string().optional().nullable(),
      port: z.number().optional().nullable(),
      tls: z.boolean().optional().nullable(),
      user: z.string().optional().nullable(),
      pass: z.string().optional().nullable(),
      notif_email: z.string().optional().nullable(),
      enable_comment_notif: z.boolean().optional().nullable(),
      enable: z.boolean()
    })

    // storage: z.object({
    //   type: z.string().optional().nullable(),
    //   base_path: z.string().optional().nullable(),
    //   end_point: z.string().optional().nullable(),
    //   url_format: z.string().optional().nullable(),
    //   port: z.number().optional().nullable(),
    //   region: z.string().optional().nullable(),
    //   bucket: z.string().optional().nullable(),
    //   use_ssl: z.boolean().optional().nullable(),
    //   access_key: z.string().optional().nullable(),
    //   secret_key: z.string().optional().nullable()
    // })
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.SERVER }
  });

  if (config === null) return getNotFoundResponse(event);

  const now = new Date();

  body.created_at = Math.floor((config.created_at ?? new Date()).getTime() / 1000);

  body.updated_at = Math.floor(now.getTime() / 1000);

  await prisma.config.update({
    where: { name: ConfigNameEnum.SERVER },
    data: {
      updated_at: now,
      updated_by: event.context.user.id,
      data: body
    }
  });

  return getOKResponse(event);
});
