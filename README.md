# Ly Blog · 基于 Nuxt 4 的博客项目

Ly Blog 是一个基于 Nuxt 4 构建的全栈博客系统，支持文章管理、笔记管理、留言板、图片资源管理以及“一言（Hitokoto）”等功能模块，采用现代前端技术与轻量后端方案，开箱即用、易于部署。

## 技术栈
- 框架：Nuxt 4 + Nuxt UI 4
- 语言：TypeScript（严格模式）
- 样式：Tailwind CSS v4
- 状态管理：Pinia
- 数据库：Prisma + PostgreSQL
- 其他：Vue 3、Vue Router、Axios、Zod 等

## 环境要求
- Node.js 18+（建议使用 LTS 版本）
- 包管理器：`pnpm`、`npm`、`yarn` 或 `bun`（任选其一）
- 可用的 PostgreSQL 数据库实例

## 快速开始
1. 安装依赖
   ```bash
   # pnpm（推荐）
   pnpm install
   # 其他包管理器
   npm install
   yarn install
   bun install
   ```
2. 配置环境变量（至少需要 `DATABASE_URL`）
   PostgreSQL 示例：
     ```env
     DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
     ```
3. 初始化数据库（仅首次或变更 schema 后）
   ```bash
   pnpm run prisma-migrate-dev
   pnpm run prisma-generate
   ```

## 开发调试
- 启动开发服务器（默认 `http://localhost:3000`）：
  ```bash
  pnpm run dev
  ```
- 代码质量与格式化：
  ```bash
  pnpm run lint
  pnpm run lint:fix
  pnpm run format
  pnpm run format:check
  pnpm run format:vue
  ```

## 构建与生产
1. 生成生产构建产物：
   ```bash
   pnpm run build
   ```
2. 运行生产服务：
   - Windows：
     ```bash
     .\run-prod.bat
     ```
   - Linux / macOS（或 WSL、Git Bash）：
     ```bash
     ./run-prod.sh
     ```
   两个启动脚本会自动检查 `Node.js`、`scripts/polyfill.mjs` 以及构建产物 `.output/server/index.mjs` 是否存在，并在缺失时给出中文提示。

3. 本地预览（Nuxt 内置）：
   ```bash
   pnpm run preview
   ```

## 目录结构
常见关键目录说明：
- `app/` 前端应用与业务模块（组件、页面、API 封装等）
- `server/` 服务端逻辑（API、配置、数据库连接等），如 `server/db/index.ts`
- `prisma/` Prisma schema 与迁移文件
- `.output/` 生产构建输出（`pnpm build` 后生成）
- `scripts/` 辅助脚本（例如 `polyfill.mjs`）

## 常见问题
- 脚本提示缺少 `.output/server/index.mjs`：
  - 先执行 `pnpm build` 生成生产构建。
- `Node.js` 未安装或未在 `PATH`：
  - 安装 Node.js 并确保终端可执行 `node` 命令。
- 数据库连接失败：
  - 检查 `DATABASE_URL` 是否为合法 PostgreSQL 连接串（可选 `schema` 参数）。

## 参考
- Nuxt 官方文档：https://nuxt.com/docs/getting-started/introduction
- Tailwind CSS 文档：https://tailwindcss.com/
- Prisma 文档：https://www.prisma.io/docs
