# 第一阶段：依赖安装
FROM docker.m.daocloud.io/library/node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci

# 第二阶段：构建应用
FROM docker.m.daocloud.io/library/node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 禁用 Next.js 遥测
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 第三阶段：运行阶段
FROM docker.m.daocloud.io/library/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的 standalone 文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# 启动服务器
CMD ["node", "server.js"]
