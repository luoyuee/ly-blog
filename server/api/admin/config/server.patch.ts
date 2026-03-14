import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    mailer: z.object({
      host: z.string().optional().nullable(),
      port: z.number().optional().nullable(),
      tls: z.boolean().optional().nullable(),
      user: z.string().optional().nullable(),
      pass: z.string().optional().nullable(),
      notif_email: z.string().optional().nullable(),
      enable_comment_notif: z.boolean().optional().nullable(),
      enable: z.boolean()
    }),

    czdb: z
      .object({
        download_url: z.string().optional().nullable()
      })
      .optional()
      .nullable()

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

  await prisma.config.update({
    where: { name: ConfigNameEnum.SERVER },
    data: {
      updated_at: now,
      updated_by: event.context.user.id,
      data: {
        ...(config.data as object),
        ...(body as object),
        updated_at: dayjs(now).format("YYYY-MM-DD HH:mm:ss")
      }
    }
  });

  return getOKResponse(event);
});
