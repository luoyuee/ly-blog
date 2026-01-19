#################################################################
# 基于最新 Node.js 官方镜像的生产环境 Dockerfile
#################################################################

# 使用官方最新 Node.js 镜像
FROM node:latest

#################################################################
# 基本目录与环境变量设置
#################################################################

# 设置工作目录为 /ly-blog
WORKDIR /ly-blog

# 配置应用运行所需的环境变量（提供占位默认值，运行容器时请覆盖）
# 注意：这些值仅用于构建阶段通过 Prisma 的 env 校验，不是真实敏感信息
ENV LY_DATABASE_URL="postgresql://user:pass@localhost:5432/dbname?schema=public"
ENV LY_CZDB_PATH="/ly-blog/database"
ENV LY_CZDB_KEY="change-me-czdb-key"
ENV LY_JWT_SECRET="change-me-jwt-secret"

#################################################################
# 依赖安装与构建
#################################################################

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run prisma-generate && npm run build

#################################################################
# 运行配置
#################################################################

# 暴露容器内部 3000 端口（宿主机请映射到 9005）
EXPOSE 3000

# 确保运行脚本具有执行权限
RUN chmod +x ./run-prod.sh

# 启动脚本（生产环境）
CMD ["./run-prod.sh"]

#################################################################
# 使用说明（示例）
#
# 1. 构建镜像：
#    docker build -t ly-blog:latest .
#
# 2. 运行容器（示例，将宿主机 9005 映射到容器 3000）：
#    docker run -d \
#      -p 9005:3000 \
#      -v /你的本地路径/ly-blog/static:/ly-blog/static \
#      -v /你的本地路径/ly-blog/database:/ly-blog/database \
#      -v /你的本地路径/ly-blog/logs:/ly-blog/logs \
#      -e LY_DATABASE_URL="你的数据库连接串" \
#      -e LY_CZDB_PATH="/ly-blog/database" \
#      -e LY_CZDB_KEY="你的 CZDB KEY" \
#      -e LY_JWT_SECRET="你的 JWT 密钥" \
#      --name ly-blog \
#      ly-blog:latest
#
# 说明：
# - -p 9005:3000 将宿主机 9005 端口映射到容器 3000
# - static、database、logs 目录通过挂载实现数据持久化
# - 这些目录已在 .dockerignore 中忽略，不会被打包进镜像
# - 其他代码和依赖由镜像在构建阶段通过 npm 安装和构建
#################################################################

