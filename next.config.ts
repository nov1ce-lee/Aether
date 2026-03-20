import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // 减少部署包体积
  experimental: {
    // 针对低配置服务器优化
    cpus: 1, // 限制构建时使用的 CPU 核心数，防止打满 CPU 导致失联
  }
};

export default nextConfig;
