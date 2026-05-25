import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { useFileStorage } from "@@/server/utils/useFileStorage";
import { requireAccessScope } from "@@/server/utils/auth/access-token";
import { AccessTokenScopeEnum } from "#shared/enums";
import { prisma } from "@@/server/db";
import { fileTypeFromBuffer } from "file-type";
import { readFormData } from "h3";
import unzipper from "unzipper";
import { z } from "zod";
import path from "node:path";
import mime from "mime";

type ZipDirectoryEntry = {
  path: string;
  type: string;
  buffer: () => Promise<Buffer>;
};

type ImportedAsset = {
  sourcePath: string;
  url: string;
};

const manifestSchema = z.object({
  version: z.string(),
  source: z.object({
    type: z.string().min(1).max(64),
    id: z.string().min(1).max(255),
    url: z.string().max(512).optional()
  }),
  article: z.object({
    title: z.string().min(1).max(512),
    format: z.literal("markdown"),
    contentFile: z.literal("content.md"),
    updatedAt: z.string().datetime({ offset: true }).nullable().optional()
  }),
  assets: z
    .array(
      z.object({
        path: z.string().min(1),
        mimeType: z.string().optional(),
        size: z.number().int().nonnegative().optional()
      })
    )
    .optional()
});

const normalizeZipPath = (value: string): string => value.replace(/\\/g, "/");

const isSafeZipPath = (value: string): boolean => {
  const normalized = normalizeZipPath(value);
  return normalized.length > 0 && !path.isAbsolute(normalized) && !normalized.split("/").includes("..");
};

const readZipText = async (entries: Map<string, ZipDirectoryEntry>, filename: string): Promise<string> => {
  const entry = entries.get(filename);
  if (!entry) throw new Error(`${filename} does not exist`);
  return (await entry.buffer()).toString("utf8");
};

const replaceAssetPaths = (content: string, assets: ImportedAsset[]): string => {
  return assets.reduce((result, asset) => result.split(asset.sourcePath).join(asset.url), content);
};

export default defineEventHandler(async (event) => {
  requireAccessScope(event, AccessTokenScopeEnum.NOTE_IMPORT);

  const formData = await readFormData(event);
  const file = formData.get("file");
  const dryRun = formData.get("dryRun") === "true";

  if (!file || !(file instanceof File)) return getBadResponse(event, "缺少 ZIP 内容包");
  if (file.size === 0) return getBadResponse(event, "ZIP 内容包不能为空");

  const zipBuffer = Buffer.from(await file.arrayBuffer());
  const zipDirectory = await unzipper.Open.buffer(zipBuffer);
  const entries = new Map<string, ZipDirectoryEntry>();

  for (const entry of zipDirectory.files as ZipDirectoryEntry[]) {
    const entryPath = normalizeZipPath(entry.path);
    if (!isSafeZipPath(entryPath)) return getBadResponse(event, `非法 ZIP 路径：${entry.path}`);
    if (entry.type === "File") entries.set(entryPath, entry);
  }

  let manifest: z.infer<typeof manifestSchema>;
  let content: string;

  try {
    manifest = manifestSchema.parse(JSON.parse(await readZipText(entries, "manifest.json")));
    content = await readZipText(entries, manifest.article.contentFile);
  } catch (error) {
    return getBadResponse(event, error instanceof Error ? error.message : "内容包校验失败");
  }

  const manifestAssets = manifest.assets ?? [];
  const fileStorage = useFileStorage();
  const importedAssets: ImportedAsset[] = [];
  const now = new Date();

  for (const asset of manifestAssets) {
    const assetPath = normalizeZipPath(asset.path);
    if (!assetPath.startsWith("assets/") || !isSafeZipPath(assetPath)) {
      return getBadResponse(event, `非法资源路径：${asset.path}`);
    }

    const entry = entries.get(assetPath);
    if (!entry) return getBadResponse(event, `资源不存在：${asset.path}`);

    const buffer = await entry.buffer();
    const detectedType = await fileTypeFromBuffer(buffer);
    const ext = detectedType?.ext ?? path.extname(assetPath).replace(/^\./, "");
    if (!ext) return getBadResponse(event, `无法识别资源类型：${asset.path}`);

    const hash = fileStorage.getHash(buffer);
    const filename = `${hash}.${ext}`;

    if (!dryRun && !(await fileStorage.exists(filename))) {
      await fileStorage.save(buffer, ext);
    }

    if (!dryRun) {
      await prisma.asset.upsert({
        where: { hash },
        create: {
          created_at: now,
          created_by: null,
          hash,
          ext,
          mime_type: detectedType?.mime ?? asset.mimeType ?? mime.getType(ext),
          size: fileStorage.getSize(buffer),
          metadata: { importPath: assetPath }
        },
        update: {
          updated_at: now,
          updated_by: null
        }
      });
    }

    importedAssets.push({
      sourcePath: assetPath,
      url: `/api/asset/${hash}`
    });
  }

  const finalContent = replaceAssetPaths(content, importedAssets);
  const sourceUpdatedAt = manifest.article.updatedAt ? new Date(manifest.article.updatedAt) : null;

  if (dryRun) {
    return getOKResponse(event, {
      success: true,
      operation: "validated",
      articleId: null,
      source: manifest.source,
      url: null,
      warnings: []
    });
  }

  const existingNote = await prisma.note.findFirst({
    where: {
      source_type: manifest.source.type,
      source_id: manifest.source.id,
      status: 1
    }
  });

  if (existingNote) {
    if (existingNote.content !== finalContent) {
      await prisma.noteVersion.create({
        data: {
          created_at: now,
          created_by: null,
          note_id: existingNote.id,
          folder_id: existingNote.folder_id,
          name: existingNote.name,
          version: existingNote.version,
          extension: existingNote.extension,
          metadata: existingNote.metadata === null ? undefined : JSON.stringify(existingNote.metadata),
          content: existingNote.content,
          chars: existingNote.chars
        }
      });
    }

    const note = await prisma.note.update({
      where: { id: existingNote.id },
      data: {
        updated_at: now,
        updated_by: null,
        name: manifest.article.title,
        extension: "md",
        content: finalContent,
        content_updated_at: now,
        chars: finalContent.length,
        version: existingNote.version + 1,
        source_url: manifest.source.url,
        source_updated_at: sourceUpdatedAt,
        imported_at: now,
        metadata: {
          manifestVersion: manifest.version,
          assetPaths: manifestAssets.map((asset) => asset.path)
        }
      }
    });

    return getOKResponse(event, {
      success: true,
      operation: "updated",
      articleId: note.id,
      source: manifest.source,
      url: null,
      warnings: []
    });
  }

  const note = await prisma.note.create({
    data: {
      created_at: now,
      created_by: null,
      name: manifest.article.title,
      extension: "md",
      version: 1,
      content: finalContent,
      content_updated_at: now,
      chars: finalContent.length,
      source_type: manifest.source.type,
      source_id: manifest.source.id,
      source_url: manifest.source.url,
      source_updated_at: sourceUpdatedAt,
      imported_at: now,
      metadata: {
        manifestVersion: manifest.version,
        assetPaths: manifestAssets.map((asset) => asset.path)
      }
    }
  });

  return getOKResponse(event, {
    success: true,
    operation: "created",
    articleId: note.id,
    source: manifest.source,
    url: null,
    warnings: []
  });
});
