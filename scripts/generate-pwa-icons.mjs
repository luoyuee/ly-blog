import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const src = await readFile(join(publicDir, "ly.svg"));

// 以高密度光栅化 SVG（矢量重采样保证大尺寸清晰），再缩放到目标尺寸
const render = (size) => {
  return sharp(src, { density: 600 }).resize(size, size).png().toBuffer();
};

const blank = (size, bg) => {
  return { create: { width: size, height: size, channels: 4, background: bg } };
};

// 标准图标：透明底，铺满
for (const s of [192, 512]) {
  await sharp(await render(s)).toFile(join(publicDir, `pwa-${s}x${s}.png`));
}

// Apple Touch Icon：白底，图标约占 85%
const appleMark = Math.round(180 * 0.85);
const appleBuf = await sharp(src, { density: 600 }).resize(appleMark, appleMark).png().toBuffer();
await sharp(blank(180, "#ffffff"))
  .composite([{ input: appleBuf, gravity: "center" }])
  .png()
  .toFile(join(publicDir, "apple-touch-icon.png"));

// Maskable 图标：白底满铺，图标置于 60% 安全区中心（兼容被裁切）
for (const s of [192, 512]) {
  const mark = Math.round(s * 0.6);
  const markBuf = await sharp(src, { density: 600 }).resize(mark, mark).png().toBuffer();
  await sharp(blank(s, "#ffffff"))
    .composite([{ input: markBuf, gravity: "center" }])
    .png()
    .toFile(join(publicDir, `pwa-maskable-${s}x${s}.png`));
}

console.log("PWA 图标已生成：pwa-192/512、maskable-192/512、apple-touch-icon(180)");
