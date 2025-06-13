# Electron Monorepo 模板

一个基于 monorepo 架构构建的现代 Electron 应用模板，集成了 React、TypeScript、Hono 和全栈类型安全。

## 🚀 特性

- **🔧 Monorepo 架构**: 基于 Turborepo 和 pnpm workspaces
- **⚡ 现代前端**: React 19 + TypeScript + Vite + TanStack Router
- **🖥️ Electron 桌面**: 跨平台桌面应用程序
- **🌐 后端 API**: Hono.js REST API 与 OpenAPI 文档
- **🗄️ 数据库**: PostgreSQL 配合 Drizzle ORM
- **🔒 类型安全**: 端到端 TypeScript 与共享类型
- **📋 代码质量**: ESLint，TypeScript 严格模式
- **🔄 热重载**: 支持热模块替换的开发服务器
- **📦 构建系统**: 使用 Turbo 和 Vite 的优化构建

## 📁 项目结构

```
├── frontend/              # Electron + React 前端
│   ├── src/              # React 应用源码
│   ├── electron/         # Electron 主进程
│   └── dist-electron/    # 构建的 Electron 文件
├── server/               # Hono.js 后端 API
│   ├── api/             # API 路由和处理器
│   ├── db/              # 数据库架构和迁移
│   └── utils/           # 共享工具和类型
├── packages/            # 共享包
│   ├── eslint-config/   # 共享 ESLint 配置
│   └── typescript-config/ # 共享 TypeScript 配置
└── turbo.json           # Turborepo 配置
```

## 🛠️ 技术栈

### 前端
- **框架**: React 19 配合 TypeScript
- **桌面**: Electron 30
- **打包工具**: Vite
- **路由**: TanStack Router
- **HTTP 客户端**: ky
- **状态管理**: TanStack Query

### 后端
- **框架**: Hono.js
- **数据库**: PostgreSQL 配合 Drizzle ORM
- **数据验证**: Zod
- **API 文档**: OpenAPI 配合 Scalar
- **运行时**: Node.js

### 开发工具
- **Monorepo**: Turborepo + pnpm workspaces
- **包管理器**: pnpm
- **代码检查**: ESLint
- **类型检查**: TypeScript

## 🚀 快速开始

### 前置条件

- Node.js (>=22)
- pnpm (>=9)
- PostgreSQL 数据库

### 安装

1. 克隆仓库:
```bash
git clone <repository-url>
cd electron-monorepo-template
```

2. 安装依赖:
```bash
pnpm install
```

3. 设置环境变量:
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，配置你的数据库信息
```

4. 设置数据库:
```bash
pnpm server:migrate
```

### 开发

启动开发服务器:

```bash
# 启动所有服务
pnpm dev

# 或启动特定服务
pnpm frontend:dev  # 仅前端
pnpm server:dev    # 仅后端
```

应用程序将在以下地址可用:
- Electron 应用: 自动启动
- API 服务器: http://localhost:3000
- API 文档: http://localhost:3000/reference

### 构建

构建整个项目:

```bash
pnpm build
```

构建特定包:

```bash
turbo build --filter=frontend
turbo build --filter=server
```

### 生产环境

启动生产服务器:

```bash
pnpm start
```

## 📝 可用脚本

### 根目录级别
- `pnpm dev` - 启动所有开发服务器
- `pnpm build` - 构建所有包
- `pnpm typecheck` - 运行类型检查
- `pnpm lint` - 运行代码检查
- `pnpm start` - 启动生产服务器

### 前端
- `pnpm frontend:dev` - 启动前端开发服务器
- `pnpm frontend:build` - 构建前端和 Electron 应用

### 服务器
- `pnpm server:dev` - 启动后端开发服务器
- `pnpm server:build` - 构建后端
- `pnpm server:migrate` - 运行数据库迁移
- `pnpm server:studio` - 打开 Drizzle Studio

## 🗄️ 数据库

此模板使用 PostgreSQL 配合 Drizzle ORM。数据库配置位于 `server/db/` 目录中。

### 数据库操作

```bash
# 生成迁移文件
pnpm server:generate

# 运行迁移
pnpm server:migrate

# 打开数据库工作室
pnpm server:studio
```

## 🔧 配置

### 环境变量

在根目录创建 `.env.local` 文件:

```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/database
```

### TypeScript

项目使用共享的 TypeScript 配置:
- `packages/typescript-config` - 基础 TypeScript 配置
- 每个包中的单独 `tsconfig.json` 文件

### ESLint

共享的 ESLint 配置位于 `packages/eslint-config` 中。

## 🤝 贡献

1. Fork 此仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📄 许可证

此项目基于 ISC 许可证。

## 🙏 致谢

- [Turborepo](https://turbo.build/) 提供的 monorepo 架构
- [Electron](https://www.electronjs.org/) 提供的桌面框架
- [React](https://react.dev/) 提供的 UI 框架
- [Hono](https://hono.dev/) 提供的 Web 框架
- [Drizzle ORM](https://orm.drizzle.team/) 提供的数据库 ORM
- [Vite](https://vitejs.dev/) 提供的构建工具 