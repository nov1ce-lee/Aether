import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  output: isGithubActions ? 'export' : 'standalone', // GitHub Actions 环境使用 export，本地/Docker 使用 standalone
  basePath: isGithubActions ? '/Aether' : '', // GitHub Pages 部署在子路径下
  experimental: {
    cpus: 1, // 限制构建 CPU 核心数，防止 2C2G 服务器 OOM 或卡死
  },
  images: {
    unoptimized: true, // 静态导出不支持 Next.js 默认的图片优化
  }
};

export default nextConfig;
