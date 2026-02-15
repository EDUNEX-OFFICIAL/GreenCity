# Green-City Enterprise SaaS – Project Structure Documentation

## 1. Purpose of This Repository

This repository is an enterprise-grade SaaS monorepo designed to support:
- Multi-tenant PostgreSQL
- Modular monolith architecture
- Cloud-agnostic deployment

## 2. High-Level Repository Layout

```
green-city/
├── apps/              # Deployable applications
├── packages/          # Shared kernel (pure, framework-agnostic)
├── docs/              # Architecture & system documentation
├── infra/             # Infrastructure & deployment configuration
│
├── docker-compose.yml # Local development database (PostgreSQL)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── package.json
└── README.md
```

---

## 3. Applications Layer (apps/)

### 3.1 Backend Application (apps/backend)

**Purpose**: API, Business Logic, and Database Access.

**Structure**:
```
apps/backend/
├── prisma/
│   └── schema.prisma # Prisma Schema (PostgreSQL Source of Truth)
├── src/
│   ├── app.ts        # App setup
│   ├── server.ts     # Server entry point
│   ├── bootstrap.ts
│   ├── prisma.ts     # Prisma Client instance
│   └── debug-prisma.ts
├── package.json
└── tsconfig.json
```

**Database**:
- Uses **PostgreSQL** via **docker-compose.yml**.
- **Prisma ORM** manages schema and migrations.
- `schema.prisma` is the definitive source for the database schema.

### 3.2 Frontend Application (apps/frontend)

**Purpose**: User Interface (Next.js).

**Structure**:
```
apps/frontend/
├── src/
│   ├── app/          # Next.js App Router Pages & Layouts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/          # Utilities and helpers
│   └── components/   # (If applicable)
├── public/
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 4. Shared Packages (packages/)

Shared logic used by both Frontend and Backend.

```
packages/
├── shared-constants  # Constant values shared across apps
├── shared-types      # TypeScript interfaces/types shared across apps
└── shared-utils      # Common utility functions
```

---

## 5. Infrastructure & Config

- **Root**: `docker-compose.yml` configures the local PostgreSQL instance.
- **Turbo**: `turbo.json` handles build computation caching.
- **PNPM**: `pnpm-workspace.yaml` manages the monorepo workspace.

---

## 6. Architectural Rules

- **Strict Boundaries**: Frontend must not access the database directly; it must go through the Backend API.
- **Shared Code**: Code reused between backend and frontend must live in `packages/`.
- **Database**: All database changes must be reflected in `apps/backend/prisma/schema.prisma`.
