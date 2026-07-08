import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readFormData } from "h3";
import { z } from "zod";

/**
 * 导入导航网站数据。
 *
 * 规则：
 * 1. 仅支持 JSON 文件。
 * 2. 导入时忽略 id 字段。
 * 3. 与数据库中已有数据按 name、url、description 三个字段进行完全匹配对比，
 *    若存在完全匹配的记录则跳过，否则新增。
 */
export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);

  const file: File | null = formData.get("file") as File;
  if (file === null) {
    return getBadResponse(event, "数据异常");
  }

  if (file.type !== "application/json") {
    return getBadResponse(event, "仅支持 JSON 文件");
  }

  const arrayBuffer = await file.arrayBuffer();
  const content = Buffer.from(arrayBuffer).toString("utf8");

  let jsonData: unknown;
  try {
    jsonData = JSON.parse(content);
  } catch {
    return getBadResponse(event, "JSON 解析失败");
  }

  const schema = z
    .object({
      name: z.string().min(1),
      url: z.url("请输入有效的URL地址"),
      icon: z.string().optional().nullable(),
      tags: z.array(z.string()).optional().nullable(),
      description: z.string().optional().nullable(),
      type: z.number().int().default(1),
      hot: z.number().int().min(0).default(0),
      is_favorite: z.boolean().default(false),
      is_public: z.boolean().default(true),
      status: z.number().int().default(1)
    })
    .array();

  const { data, error } = schema.safeParse(jsonData);

  if (error) return getBadResponse(event, error.message);

  // 查询数据库中所有未删除的记录，仅取出参与对比的字段
  const existing = await prisma.navigationWebsite.findMany({
    where: {
      status: { not: 0 }
    },
    select: {
      name: true,
      url: true,
      description: true
    }
  });

  /**
   * 将参与对比的字段归一化为字符串签名，用于精确匹配判断。
   * - description：null、undefined、空字符串统一视为 null
   * - name / url：原值参与对比
   */
  const normalizeSignature = (item: {
    name: string;
    url: string;
    description?: string | null;
  }): string => {
    const normalizeString = (value?: string | null): string | null => {
      if (value === null || value === undefined || value === "") return null;
      return value;
    };

    return JSON.stringify({
      name: item.name,
      url: item.url,
      description: normalizeString(item.description)
    });
  };

  // 构建已有数据的签名集合，便于 O(1) 查找
  const existingSignatures = new Set<string>();
  for (const item of existing) {
    existingSignatures.add(
      normalizeSignature({
        name: item.name,
        url: item.url,
        description: item.description
      })
    );
  }

  const now = new Date();
  const toCreate: Array<{
    created_at: Date;
    created_by: number;
    name: string;
    url: string;
    icon?: string;
    tags?: string[];
    description?: string;
    type: number;
    hot: number;
    is_favorite: boolean;
    is_public: boolean;
    status: number;
  }> = [];

  let skippedCount = 0;

  for (const item of data) {
    const signature = normalizeSignature(item);

    // 完全匹配则跳过
    if (existingSignatures.has(signature)) {
      skippedCount++;
      continue;
    }

    // 将签名加入集合，避免本次导入中出现重复数据被多次新增
    existingSignatures.add(signature);

    toCreate.push({
      created_at: now,
      created_by: event.context.user.id,
      name: item.name,
      url: item.url,
      icon: item.icon || undefined,
      tags: item.tags && item.tags.length > 0 ? item.tags : undefined,
      description: item.description || undefined,
      type: item.type,
      hot: item.hot,
      is_favorite: item.is_favorite,
      is_public: item.is_public,
      status: item.status
    });
  }

  let createdCount = 0;
  if (toCreate.length > 0) {
    const result = await prisma.navigationWebsite.createMany({
      data: toCreate
    });
    createdCount = result.count;
  }

  return getOKResponse(event, {
    total: data.length,
    created: createdCount,
    skipped: skippedCount
  });
});
