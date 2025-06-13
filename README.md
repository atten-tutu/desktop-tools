# Electron Monorepo Template

A modern Electron application template built with a monorepo architecture, featuring React, TypeScript, Hono, and full-stack type safety.

## 🚀 Features

- **🔧 Monorepo Architecture**: Powered by Turborepo and pnpm workspaces
- **⚡ Modern Frontend**: React 19 + TypeScript + Vite + TanStack Router
- **🖥️ Electron Desktop**: Cross-platform desktop application
- **🌐 Backend API**: Hono.js REST API with OpenAPI documentation
- **🗄️ Database**: PostgreSQL with Drizzle ORM
- **🔒 Type Safety**: End-to-end TypeScript with shared types
- **📋 Code Quality**: ESLint, TypeScript strict mode
- **🔄 Hot Reload**: Development server with hot module replacement
- **📦 Build System**: Optimized builds with Turbo and Vite

## 📁 Project Structure

```
├── frontend/              # Electron + React frontend
│   ├── src/              # React application source
│   ├── electron/         # Electron main process
│   └── dist-electron/    # Built Electron files
├── server/               # Hono.js backend API
│   ├── api/             # API routes and handlers
│   ├── db/              # Database schema and migrations
│   └── utils/           # Shared utilities and types
├── packages/            # Shared packages
│   ├── eslint-config/   # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── turbo.json           # Turborepo configuration
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Desktop**: Electron 30
- **Bundler**: Vite
- **Routing**: TanStack Router
- **HTTP Client**: ky
- **State Management**: TanStack Query

### Backend
- **Framework**: Hono.js
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod
- **API Documentation**: OpenAPI with Scalar
- **Runtime**: Node.js

### Development Tools
- **Monorepo**: Turborepo + pnpm workspaces
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (>=22)
- pnpm (>=9)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd electron-monorepo-template
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your database configuration
```

4. Set up the database:
```bash
pnpm server:migrate
```

### Development

Start the development servers:

```bash
# Start all services
pnpm dev

# Or start specific services
pnpm frontend:dev  # Frontend only
pnpm server:dev    # Backend only
```

The application will be available at:
- Electron app: Launches automatically
- API server: http://localhost:3000
- API documentation: http://localhost:3000/reference

### Building

Build the entire project:

```bash
pnpm build
```

Build specific packages:

```bash
turbo build --filter=frontend
turbo build --filter=server
```

### Production

Start the production server:

```bash
pnpm start
```

## 📝 Available Scripts

### Root Level
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm typecheck` - Run type checking
- `pnpm lint` - Run linting
- `pnpm start` - Start production servers

### Frontend
- `pnpm frontend:dev` - Start frontend development server
- `pnpm frontend:build` - Build frontend and Electron app

### Server
- `pnpm server:dev` - Start backend development server
- `pnpm server:build` - Build backend
- `pnpm server:migrate` - Run database migrations
- `pnpm server:studio` - Open Drizzle Studio

## 🗄️ Database

This template uses PostgreSQL with Drizzle ORM. The database configuration is located in `server/db/`.

### Database Operations

```bash
# Generate migration files
pnpm server:generate

# Run migrations
pnpm server:migrate

# Open database studio
pnpm server:studio
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/database
```

### TypeScript

The project uses shared TypeScript configurations:
- `packages/typescript-config` - Base TypeScript config
- Individual `tsconfig.json` files in each package

### ESLint

Shared ESLint configuration is available in `packages/eslint-config`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Turborepo](https://turbo.build/) for the monorepo architecture
- [Electron](https://www.electronjs.org/) for the desktop framework
- [React](https://react.dev/) for the UI framework
- [Hono](https://hono.dev/) for the web framework
- [Drizzle ORM](https://orm.drizzle.team/) for the database ORM
- [Vite](https://vitejs.dev/) for the build tool 