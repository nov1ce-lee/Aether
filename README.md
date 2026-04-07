# Aether - 简单的工具站集合

Aether 是一个极简且高效的多页面工具网站，旨在为开发者提供纯粹的工具体验。

## ✨ 特性

- **现代 UI 设计**: 动态流体背景与磨砂玻璃质感。
- **响应式设计**: 完美适配桌面与移动端设备。
- **高性能**: 基于 Next.js 15 App Router。
- **一键复制**: 所有工具均提供便捷的复制功能。

## 🛠️ 已集成工具

1. **Docker 指令生成**:
   - 快速生成常用的 Docker 运行、构建与管理指令。
2. **SQL 指令生成**:
   - 解析 MySQL 建表语句，通过可视化勾选字段快速生成 SELECT、WHERE 等查询语句。
3. **变量命名转换**:
   - 支持驼峰、下划线、中划线等多种命名规范的互转。
4. **Git 提交规范**:
   - 通过描述自动生成符合 Conventional Commits 规范的提交信息。
5. **数据加解密**:
   - 支持文本加解密以及二进制 .dat 档案的解析与修改。

## 🚀 快速开始

### 1. 环境准备
确保已安装 Node.js (v18.17.0+)。

### 2. 获取并运行
```bash
git clone https://github.com/nov1ce-lee/Aether.git
cd Aether
npm install
npm run dev
```

### 🐳 3. Docker 一键部署
你可以通过 Docker 快速构建并部署 Aether：

```bash
# 构建镜像
docker build -t aether-app .

# 启动容器 (映射端口 3001)
docker run -d -p 3001:3001 --name aether aether-app
```

或者使用 Docker Compose 一键启动：
```bash
docker compose up -d
```

启动后即可通过 `http://localhost:3001` 访问。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源。

---
Aether Tool Collection © 2026.
