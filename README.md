# Ly Blog · 基于 Nuxt 4 的博客项目

Ly Blog 是一个基于 Nuxt 4 构建的全栈博客系统，支持文章管理、笔记管理、留言板、图片资源管理以及“一言（Hitokoto）”等功能模块，采用现代前端技术与轻量后端方案，开箱即用、易于部署。

![ly-blog](/docs/images/001.png)

> ⚡注意：本项目还处于前期开发阶段，部分功能可能不稳定或缺失。API和数据库结构可能会在后续版本中发生变化。

## 技术栈
- 框架：Nuxt 4 + Nuxt UI 4
- 语言：TypeScript（严格模式）
- 样式：Tailwind CSS v4
- 状态管理：Pinia
- 数据库：Prisma + PostgreSQL
- 其他：Vue 3、Vue Router、Axios、Zod 等

## 环境要求
- Node.js 24+（建议使用 LTS 版本）
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
2. 配置环境变量（至少需要 `LY_DATABASE_URL`、`LY_JWT_SECRET`、`LY_CZDB_KEY`）
   PostgreSQL 示例（可选 `schema` 参数）：
   ```env
   LY_DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
   LY_JWT_SECRET="change-me"
   LY_CZDB_KEY="change-me"
   # 可选：纯真 IP 库目录，不配置时默认使用 /data/czdb
   LY_CZDB_PATH="/ly-blog/data/czdb"
   ```
3. 初始化数据库（仅首次或变更 schema 后）
   ```bash
   pnpm run prisma:migrate-dev
   pnpm run prisma:generate
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
   两个启动脚本实际执行的就是：`node -r ./scripts/polyfill.mjs ./.output/server/index.mjs`（Windows 路径分隔符略有不同）。

3. 本地预览（Nuxt 内置）：
   ```bash
   pnpm run preview
   ```

## Docker 部署
使用仓库根目录的 [Dockerfile](/Dockerfile) 构建镜像并运行容器。

1. 构建镜像：
   ```bash
   docker build -t ly-blog:latest .
   ```
2. 运行容器（示例：宿主机 9005 映射到容器 3000）：
   ```bash
   docker run -d \
     -p 9005:3000 \
     -v /你的本地路径/ly-blog/data:/ly-blog/data \
     -e LY_DATABASE_URL="你的数据库连接串" \
     -e LY_CZDB_PATH="/ly-blog/database" \
     -e LY_CZDB_KEY="你的 CZDB KEY" \
     -e LY_JWT_SECRET="你的 JWT 密钥" \
     --name ly-blog \
     ly-blog:latest
   ```
3. 说明：
   - `-v /你的本地路径/ly-blog/data:/ly-blog/data` 用于数据持久化（文件、日志、备份、czdb 等均在 `/ly-blog/data` 下）。
   - 数据库使用外部 PostgreSQL（由 `LY_DATABASE_URL` 指向），容器内不自带数据库。
   - 如果你的数据库也在 Docker 内，注意把 `host` 替换成同一网络下可访问的主机名（例如 compose service 名）。

## 目录结构
常见关键目录说明：
- `app/` 前端应用与业务模块（组件、页面、API 封装等）
- `server/` 服务端逻辑（API、配置、数据库连接等），如 `server/db/index.ts`
- `prisma/` Prisma schema 与迁移文件
- `.output/` 生产构建输出（`pnpm build` 后生成）
- `scripts/` 辅助脚本（例如 `polyfill.mjs`）
- `docs/` 项目文档与静态资源（例如图片），便于在文档中引用

## 常见问题
- 脚本提示缺少 `.output/server/index.mjs`：
  - 先执行 `pnpm build` 生成生产构建。
- `Node.js` 未安装或未在 `PATH`：
  - 安装 Node.js 并确保终端可执行 `node` 命令。
- 数据库连接失败：
  - 检查 `LY_DATABASE_URL` 是否为合法 PostgreSQL 连接串（可选 `schema` 参数）。

## 参考
- Nuxt 官方文档：https://nuxt.com/docs/getting-started/introduction
- Tailwind CSS 文档：https://tailwindcss.com/
- Prisma 文档：https://www.prisma.io/docs
