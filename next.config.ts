import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // 启用静态导出
  basePath: process.env.NODE_ENV === 'production' ? '/Aether' : '', // 如果部署在 github.io/Aether/，则需要设置 basePath
  images: {
    unoptimized: true, // 静态导出不支持 Next.js 默认的图片优化
  },
  experimental: {
    // 针对低配置服务器优化
    cpus: 1, // 限制构建时使用的 CPU 核心数，防止打满 CPU 导致失联
  }
};

export default nextConfig;
