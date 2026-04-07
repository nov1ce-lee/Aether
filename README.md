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

### 🐳 3. Docker 部署

#### 方式 A：直接拉取镜像 (推荐)
你可以直接拉取已构建好的 Docker 镜像（托管于 GitHub Packages）：

```bash
# 拉取镜像
docker pull ghcr.io/nov1ce-lee/aether:latest

# 启动容器
docker run -d -p 3001:3001 --name aether ghcr.io/nov1ce-lee/aether:latest
```

#### 方式 B：本地构建部署
如果你想在本地自行构建：

```bash
# 构建镜像
docker build -t aether-app .

# 启动容器
docker run -d -p 3001:3001 --name aether aether-app
```

或者使用 Docker Compose：
```bash
docker compose up -d
```

启动后即可通过 `http://localhost:3001` 访问。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源。

---
Aether Tool Collection © 2026.
