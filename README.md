# Aether - 实验性开发者工具协议

Aether 是一个极简且具有视觉冲击力的多页面工具网站，旨在为开发者提供高效、纯粹的工具体验。采用 Next.js 15+ 和 Framer Motion 构建，具有独特的 "Aetheric Flux" 实验性 UI 设计。

## ✨ 特性

- **Aetheric Flux UI**: 动态流体背景与磨砂玻璃质感，提供沉浸式视觉体验。
- **响应式设计**: 完美适配桌面与移动端设备。
- **高性能**: 基于 Next.js 15 App Router，极致的加载速度与路由体验。
- **一键复制**: 所有工具均提供带有即时反馈的复制功能。

## 🛠️ 已集成工具

1. **Docker 指令工厂**:
   - 支持 `run`, `exec`, `build`, `ps`, `images`, `logs`, `cleanup` 等常用指令。
   - 动态端口映射、卷挂载、环境变量配置。
   - 实时指令预览。

2. **变量命名转换器**:
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
git clone https://github.com/your-username/Aether.git
cd Aether
```

### 3. 安装依赖
```bash
npm install
```

### 4. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可看到效果。

### 5. 生产构建
如果你需要部署到生产环境：
```bash
npm run build
npm start
```

## 🧪 技术栈

- **框架**: [Next.js 15 (App Router)](https://nextjs.org/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)
- **语言**: TypeScript

---
Aether Tool Protocol © 2026. Experimental Interface.
