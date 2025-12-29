import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const navMenuSchema: z.ZodType = z.lazy(() =>
    z.object({
      id: z.number(),
      title: z.string(),
      href: z.string().optional().nullable(),
      icon: z.string().optional().nullable(),
      show: z.boolean(),
      children: z.array(navMenuSchema).optional().nullable()
    })
  );

  const schema = z.object({
    created_at: z.number().optional().nullable(),
    updated_at: z.number().optional().nullable(),
    locale: z.string(),

    basic: z.object({
      title: z.string(),
      site_url: z.url().optional().nullable(),
      description: z.string(),
      keywords: z.string().array().optional().nullable()
    }),

    author_card: z.object({
      name: z.string(),
      name_link: z.string().optional().nullable(),
      avatar: z.string().optional().nullable(),
      motto: z.string().optional().nullable(),
      links: z
        .object({
          title: z.string(),
          href: z.string()
        })
        .array(),
      link_icon: z.string().optional().nullable()
    }),

    external_link_card: z
      .object({
        title: z.string(),
        href: z.url(),
        icon: z.string().optional().nullable()
      })
      .array(),

    background: z.object({
      home_page_bg: z.string().optional().nullable(),
      home_title: z.string().optional().nullable(),
      home_sub_title: z.string().optional().nullable(),
      article_page_bg: z.string().optional().nullable(),
      catalog_page_bg: z.string().optional().nullable(),
      tag_page_bg: z.string().optional().nullable()
    }),

    swiper: z
      .object({
        title: z.string(),
        href: z.string().url(),
        image: z.string()
      })
      .array(),

    nav_menu: z.array(navMenuSchema),

    beian: z.object({
      beian_code: z.string().optional().nullable(),
      icp_code: z.string().optional().nullable()
    }),

    hitokoto: z.object({
      max_length: z.number().optional().nullable(),
      type: z.number().array().optional().nullable()
    }),

    article: z.object({
      comment_max_length: z.number().optional().nullable(),
      payment_qr_code: z
        .object({
          name: z.string(),
          image: z.string()
        })
        .array()
        .optional()
        .nullable()
    }),

    message_board: z.object({
      intro: z.string().optional().nullable(),
      message_max_length: z.number().optional().nullable()
    }),

    fleeting_thought: z.object({
      intro: z.string().optional().nullable()
    })
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.CLIENT }
  });

  if (config === null) return getNotFoundResponse(event);

  const now = new Date();

  body.created_at = Math.floor((config.created_at ?? new Date()).getTime() / 1000);

  body.updated_at = Math.floor(now.getTime() / 1000);

  await prisma.config.update({
    where: { name: ConfigNameEnum.CLIENT },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      data: body as object
    }
  });

  return getOKResponse(event);
});
