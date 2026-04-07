import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // 启用独立服务器模式，支持 API 路由且减小镜像体积
  experimental: {
    cpus: 1, // 限制构建 CPU 核心数，防止 2C2G 服务器 OOM 或卡死
  },
  images: {
    unoptimized: true, // 静态导出不支持 Next.js 默认的图片优化
  }
};

export default nextConfig;
