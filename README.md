# Aether - 简单的工具站集合

Aether 是一个极简且具有视觉冲击力的多页面工具网站，旨在为开发者提供高效、纯粹的工具体验。采用 Next.js 15+ 和 Framer Motion 构建，具有独特的 "Aetheric Flux" 实验性 UI 设计。

## ✨ 特性

- **Aetheric Flux UI**: 动态流体背景与磨砂玻璃质感，提供沉浸式视觉体验。
- **响应式设计**: 完美适配桌面与移动端设备。
- **高性能**: 基于 Next.js 15 App Router，极致的加载速度与路由体验。
- **一键复制**: 所有工具均提供带有即时反馈的复制功能。

## 🛠️ 已集成工具

1. **Docker 指令生成器**:
   - 从基础运行到高级构建，一站式生成所有 Docker 常用指令。
   - 支持 `run`, `exec`, `build`, `ps`, `images`, `logs`, `cleanup` 等常用指令。
   - 动态端口映射、卷挂载、环境变量配置。

2. **命名转换器**:
   - 在驼峰、下划线、中划线等命名规范间自由切换。
   - 支持 `camelCase`, `PascalCase`, `snake_case`, `kebab-case`, `CONSTANT_CASE` 互转。
   - 智能识别各种分隔符，支持批量词组转换。

## 🚀 快速开始 (本地部署)

如果你想在新的机器上部署 Aether，请遵循以下步骤：

### 1. 环境准备
确保你的机器已安装：
- [Node.js](https://nodejs.org/) (推荐 v18.17.0 或更高)
- [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装)

### 2. 获取代码
```bash
git clone https://github.com/nov1ce-lee/Aether.git
cd Aether
```

### 3. 安装依赖
```bash
npm install
```

### 4. 启动开发服务器
```bash
# 默认 3000 端口
npm run dev

# 如果端口被占用，可以指定端口
PORT=4000 npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可看到效果。

### 5. 生产构建与部署
针对 2C2G 等低配置 ECS 服务器，建议如下操作：

#### 修改端口
```bash
# 在启动时通过环境变量指定端口
PORT=4000 npm start
```

#### 构建优化
如果你在服务器上执行 `npm run build` 导致死机或响应缓慢：
- **方案 A (推荐)**: 增加 Swap 虚拟内存（建议 2-4G），这是解决低内存服务器构建失败的最有效方式。
- **方案 B**: 在本地完成构建，仅将 `.next`、`public`、`package.json` 等文件上传至服务器（配合 `output: 'standalone'` 选项）。
- **方案 C**: 我们已在 `next.config.ts` 中配置了 `experimental.cpus: 1` 以限制构建时的 CPU 负载。


## 🧪 技术栈

- **框架**: [Next.js 15 (App Router)](https://nextjs.org/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)
- **语言**: TypeScript

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源。

---
Aether Tool Protocol © 2026. Experimental Interface.
