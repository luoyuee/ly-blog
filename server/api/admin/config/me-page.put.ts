import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { ConfigNameEnum } from "@@/shared/constants";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    author: z.object({
      name: z.string(),
      avatar: z.string().optional().nullable(),
      location: z.string(),
      dev_role: z.string(),
      dev_direction: z.string(),
      quote: z.string(),
      tags: z
        .object({
          label: z.string(),
          color: z.string()
        })
        .array()
    }),
    github_snake: z.object({
      light: z.string().optional().nullable(),
      dark: z.string().optional().nullable()
    }),
    intro: z.object({
      base_info: z
        .object({
          label: z.string(),
          value: z.string(),
          icon: z.string(),
          href: z.string().optional().nullable()
        })
        .array(),
      skills: z.string().array(),
      interest_tags: z.string().array(),
      language_proficiency: z.string().array()
    }),
    skills_grid: z
      .object({
        title: z.string(),
        icon: z.string(),
        href: z.string().optional().nullable()
      })
      .array(),
    website_list: z
      .object({
        title: z.string(),
        desc: z.string(),
        href: z.string(),
        icon: z.string()
      })
      .array(),
    project_list: z
      .object({
        title: z.string(),
        desc: z.string(),
        href: z.string(),
        icon: z.string()
      })
      .array(),
    social_links: z
      .object({
        title: z.string().optional().nullable(),
        href: z.string(),
        icon: z.string(),
        hover_bg: z.string().optional().nullable()
      })
      .array(),
    faq_items: z
      .object({
        label: z.string(),
        content: z.string()
      })
      .array()
  });

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  const config = await prisma.config.findUnique({
    where: { name: ConfigNameEnum.ME_PAGE }
  });

  const now = new Date();

  if (config === null) {
    await prisma.config.create({
      data: {
        name: ConfigNameEnum.ME_PAGE,
        created_at: now,
        created_by: event.context.user.id,
        updated_at: now,
        updated_by: event.context.user.id,
        data: body
      }
    });
  } else {
    await prisma.config.update({
      where: { name: ConfigNameEnum.ME_PAGE },
      data: {
        updated_at: now,
        updated_by: event.context.user.id,
        data: body
      }
    });
  }

  return getOKResponse(event);
});
