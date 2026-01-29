# Green-City Enterprise SaaS – Project Structure Documentation 

## 1. Purpose of This Repository 

This repository is an enterprise-grade SaaS monorepo designed to support: 
- Multi-tenant PostgreSQL 
- Modular monolith → microservices evolution 
- Cloud-agnostic deployment 
- Strict architectural boundaries 

This is a long-lived production system. All structure decisions are intentional. 

--- 

## 2. High-Level Repository Layout 

green-city/ 
├── apps/              # Deployable applications 
├── packages/          # Shared kernel (pure, framework-agnostic) 
├── services/          # Future microservices 
├── infra/             # Infrastructure & deployment 
├── docs/              # Architecture & system documentation 
├── scripts/           # Operational scripts 
├── tools/             # Dev & CI tooling 
│ 
├── pnpm-workspace.yaml 
├── turbo.json 
├── tsconfig.base.json 
├── package.json 
└── README.md 

Rule: 
Only folders inside `apps/` are deployable. 

--- 

## 3. Root Configuration Ownership 

### package.json (Root) 
Purpose: Monorepo orchestration only. 

Must NOT contain: 
- express 
- next 
- react 
- prisma 

Allowed: 
- turbo 
- typescript 
- linting & formatting tools 

--- 

### pnpm-workspace.yaml 
Defines workspace boundaries. No package.json should exist outside these paths. 

--- 

### turbo.json 
Defines build, lint, and typecheck orchestration. 
Used by CI and local workflows. 

--- 

## 4. Applications Layer (apps/) 

apps/ 
├── backend/ 
└── frontend/ 

Each app is independently deployable. 

--- 

## 5. Backend Application (apps/backend) 

Purpose: 
- Owns business logic 
- Owns PostgreSQL 
- Enforces tenancy 
- Exposes APIs 

Structure: 

apps/backend/ 
├── src/ 
│   ├── app.ts 
│   ├── server.ts 
│   ├── bootstrap.ts 
│   │ 
│   ├── config/           # Environment & runtime config 
│   ├── core/             # Business rules (framework-agnostic) 
│   ├── modules/          # Domain modules 
│   ├── api/              # Versioned API routing 
│   ├── middlewares/      # Auth, tenancy, errors 
│   ├── infrastructure/  # DB, cache, external systems 
│   ├── observability/    # Logs, metrics, tracing 
│   ├── jobs/             # Background jobs 
│   └── security/         # Encryption, hashing, tokens 
│ 
├── prisma/               # ORM boundary (optional) 
├── tests/ 
└── package.json 

--- 

### 5.1 core/ 
Contains pure business rules. 

Rules: 
- No Express imports 
- No DB access 
- No HTTP concepts 

--- 

### 5.2 modules/ 
Each module represents one business domain. 

Rules: 
- Modules do not import each other directly 
- DB queries live in module-owned db folders 
- Cross-domain communication via interfaces or events 

--- 

## 6. Database Architecture (PostgreSQL) 

Strategy: 
- Single database 
- Shared schema 
- Row-level multi-tenancy 

Rules: 
- Every business table contains tenant_id 
- Backend enforces tenancy at DB level 
- Frontend never accesses DB 

Database documentation lives in: 
docs/db/ 

--- 

## 7. Frontend Application (apps/frontend) 

Purpose: 
- User interface only 
- No business rules 
- API consumption only 

Structure: 

apps/frontend/ 
├── src/ 
│   ├── app/              # Next.js App Router 
│   ├── modules/          # Domain UI logic 
│   ├── components/       # Reusable UI components 
│   ├── services/         # API clients 
│   ├── store/            # Global state 
│   ├── hooks/            # Custom hooks 
│   ├── permissions/     # UI permission checks 
│   ├── feature-flags/   # Feature toggles 
│   ├── lib/              # Helpers 
│   └── types/ 
│ 
└── package.json 

Rules: 
- No direct backend imports 
- No business logic 
- UI only enforces permissions visually 

--- 

## 8. Shared Packages (packages/) 

packages/ 
├── shared-types 
├── shared-utils 
└── shared-constants 

Rules: 
- No framework imports 
- No runtime dependencies 
- Must remain pure and reusable 

--- 

## 9. Infrastructure (infra/) 

Contains cloud and deployment configuration. 

infra/ 
├── aws/ 
├── kubernetes/ 
├── terraform/ 
└── docker/ 

Changing infrastructure must never require code changes. 

--- 

## 10. Documentation (docs/) 

docs/ 
├── architecture/ 
├── api-contracts/ 
├── db/ 
├── security/ 
├── onboarding/ 
└── decisions/ 

All architectural changes must be documented here. 

--- 

## 11. Scripts (scripts/) 

scripts/ 
├── db/ 
│   ├── migrate/ 
│   ├── seed/ 
│   ├── backup/ 
│   └── restore/ 

Scripts automate operational workflows only. 

--- 

## 12. Architectural Non-Negotiables 

- No cross-app imports 
- No shared business logic 
- No DB access outside backend 
- No shortcuts around tenancy 
- Structure changes require documentation updates 

Violations introduce technical debt and are not allowed. 

--- 

Status: 
ARCHITECTURE LOCKED 
