import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // 启用静态导出
  basePath: process.env.NODE_ENV === 'production' ? '/Aether' : '', // 如果部署在 github.io/Aether/，则需要设置 basePath
  images: {
    unoptimized: true, // 静态导出不支持 Next.js 默认的图片优化
  }
};

export default nextConfig;
