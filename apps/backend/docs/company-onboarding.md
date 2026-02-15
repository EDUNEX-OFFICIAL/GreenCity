# Company Onboarding Flow (DB-per-Tenant)

## Overview
The Company Onboarding flow is the process of registering a new tenant (company) into the Green-City SaaS platform. It enforces strict data isolation by creating a dedicated PostgreSQL database for each company at runtime.

## Why DB-per-Tenant?
- **Security**: Tenant data never commingles; cross-tenant leakage is impossible.
- **Compliance**: Per-tenant backup/restore and right-to-be-forgotten are straightforward.
- **Scalability**: Individual databases can be moved to separate physical nodes or regions without affecting others.
- **Operational Clarity**: Metrics, logs, and performance tuning are scoped per customer.

## Input Contract (CompanyCreateModel)
- Source: [company.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/types/company.ts)
- Fields:
  - companyName: string
  - companyEmail: string
  - plan: "free" | "pro" | "enterprise"
  - ownerName: string
  - ownerEmail: string
  - username: string
  - password: string
  - betaMode?: boolean

## Runtime Flow (Step-by-Step)

1. **HTTP Request**  
   `POST /api/companies`  
   Payload: `CompanyCreateModel` (company name, plan, owner/admin details)

2. **Application Service – `createCompanyService`**  
   a. **Generate Identifiers**  
      - `slug` from company name  
      - `dbName` from slug (`tenant_<slug>`)

   b. **Master DB – Create Company**  
      - Insert record in `db_master.company` with `name`, `slug`, `dbName`, `plan`, `status: "active"`  
      - Returns `companyId`

   c. **Create Tenant DB**  
      - `CREATE DATABASE "<dbName>"` via `pg` client  
      - Connection string built dynamically from `DATABASE_URL` + `dbName`

   d. **Migrate Tenant Schema**  
      - Apply tenant template schema via `migrateTenantDb(dbName)`

   e. **Seed Tenant Data**  
      - Populate initial tenant data via `seedTenantDb(dbName, input)`

3. **Response**  
   `201 Created`  
   Body: `{ companyId, dbName, message }`

## Imports and Logic Purposes
- `prismaSuperUser` – Master DB Prisma Client for control-plane operations  
  [prisma.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/src/prisma.ts)
- `generateSlug(name)` – URL-safe slug builder  
  [slug.util.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/utils/slug.util.ts)
- `generateDbName(companyName)` – Postgres-safe tenant DB name with timestamp  
  [dbName.util.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/utils/dbName.util.ts)
- `createTenantDb(dbName)` – physical database creation using superuser connection  
  [createTenantDb.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/infra/createTenantDb.ts)
- `migrateTenantDb(dbName)` – apply tenant schema via prisma migrate deploy  
  [migrateTenantDb.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/infra/migrateTenantDb.ts)
- `seedTenantDb(dbName, input)` – initial data seeding from onboarding input  
  [seedTenantDb.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/infra/seedTenantDb.ts)
- `CompanyCreateModel` – strict input contract  
  [company.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/types/company.ts)
- `Client` from `pg` – maintenance operations (create/drop DB, terminate connections)
- `CompanyAlreadyExistsError` – explicit duplicate signaling for clean 409 handling
- `dropTenantDb(dbName)` – rollback helper defined in service; terminates active connections then drops the tenant DB

## End-to-End Flow (Detailed)
- Receive `CompanyCreateModel` JSON
- Generate `slug` and `dbName`
- Fail-fast duplicate check by `slug` in `db_master`
- Create `Company` row in `db_master` with `status: "active"` and `plan`
- Create physical tenant DB named `dbName`
- Apply tenant schema via migrate deploy
- Seed tenant DB using onboarding input (company profile, owner user, permissions, settings)
- Return `{ companyId, dbName, message }`

## Data Flow Diagrams

### Tenant Resolution (Backend-Only)

```mermaid
flowchart LR
    Client[Client] --> Route[Express Route /api/*]
    Route --> Svc[Service Layer]
    Svc --> Master[Master DB: Company]
    Master -->|dbName| Svc
    Svc -->|POSTGRES_BASE_URL + "/" + dbName| TenantURL[Tenant DB URL]
    TenantURL --> PrismaTenant[Prisma Client (datasources override)]
    PrismaTenant --> TenantDB[Tenant Database]
```

### Onboarding APIs (Backend-Only)

```mermaid
flowchart LR
    subgraph Onboarding Read (GET /api/onboarding/data)
      R1[Route] --> S1[Service]
      S1 --> M1[Master DB: Company (resolve dbName + onboardingStatus)]
      S1 --> T1[Prisma Tenant -> CompanyProfile, User, CompanySettings]
      T1 --> O1[Response JSON with tenant data + onboardingStatus]
    end

    subgraph Update Company (PUT /api/onboarding/company)
      R2[Route] --> S2[Service]
      S2 --> M2[Master DB: Company (resolve dbName)]
      S2 --> T2[Prisma Tenant -> CompanyProfile.update]
    end

    subgraph Update Admin (PUT /api/onboarding/admin)
      R3[Route] --> S3[Service]
      S3 --> M3[Master DB: Company (resolve dbName)]
      S3 --> T3[Prisma Tenant -> User.update]
    end

    subgraph Update Settings (PUT /api/onboarding/settings)
      R4[Route] --> S4[Service]
      S4 --> M4[Master DB: Company (resolve dbName)]
      S4 --> T4[Prisma Tenant -> CompanySettings.update]
    end

    subgraph Complete (POST /api/onboarding/complete)
      R5[Route] --> S5[Service]
      S5 --> M5[Master DB: Company]
      M5 -->|onboardingStatus set to "completed"| S5
      S5 --> O5[Idempotent response: completed or alreadyCompleted]
    end
```

### Company Provisioning (Backend-Only)

```mermaid
flowchart LR
    CRoute[Route POST /api/companies/create] --> CCtrl[Controller Validation]
    CCtrl --> CSvc[Service]
    CSvc --> MCheck[Master DB: check unique slug]
    MCheck -->|unique| MCreate[Master DB: create Company (pending)]
    MCreate --> DBName[Generate deterministic dbName]
    DBName --> TCreate[Infra: CREATE DATABASE "<dbName>"]
    TCreate --> TMigrate[Infra: Prisma migrate deploy (tenant)]
    TMigrate --> TSeed[Infra: Seed tenant data (isFirstLogin=true, settings)]
    TSeed --> CResp[201 Created { companyId, dbName }]
    MCheck -->|duplicate| C409[409 Conflict]
    TCreate -.on error.-> Rollback[Rollback: DROP tenant DB + DELETE master row]
```

## Data Partitioning

### `db_master` (Control Plane)
- `company` – tenant registry (id, name, slug, dbName, plan, status)

### `db_<tenant>` (Data Plane)
- Tenant-scoped application tables as defined by the tenant template schema

## Prisma Migration Strategy
- **Master schema** (`prisma/superuser.prisma`)  
  Applied to `db_master`
- **Tenant template** (`prisma/schema.prisma` or equivalent)  
  Applied per-tenant via `migrateTenantDb(dbName)` using a Prisma Client instantiated with the tenant connection string

## Seeding
`seedTenantDb(dbName, input)`  
- Runs inside the newly migrated tenant DB  
- Populates initial data derived from the onboarding input

## Rollback Strategy
On any error after tenant DB creation:
1. **Drop tenant DB** (`DROP DATABASE IF EXISTS "<dbName>"`)
2. **Delete master company record**
3. **Throw** to bubble the error to the controller

Guarantee: no orphaned databases and no ghost master rows.

## Layer Separation

### HTTP Layer  
`POST /api/companies` – controller maps JSON and returns HTTP status codes

### Application Layer  
`createCompanyService()` – orchestration and rollback  
[company.service.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/src/services/company.service.ts#L66-L156)

### Infrastructure Layer  
`createTenantDb()` `migrateTenantDb()` `seedTenantDb()` – DB creation, migration, seeding helpers  
[createTenantDb.ts](file:///d:/Officials/Development/Projects/GreenCity/green-city/apps/backend/infra/createTenantDb.ts)

### Data Access Layer  
`prismaSuperUser` – Prisma Client for `db_master`  
Tenant-scoped Prisma Client – ephemeral, used during migration/seeding

## Design Decisions & Constraints
- **Environment**: `DATABASE_URL_SUPERUSERS` for maintenance/master ops; tenant URLs from `DATABASE_URL` + `dbName`  
- **Dynamic URLs**: tenant connection strings built at runtime  
- **No auth yet**: caller identity not validated  
- **Sync flow**: endpoint blocks until DB is ready  
- **Slug-derived DB name**: deterministic `dbName` from `slug`

## Future Extension Points
- **AuthN/AuthZ** – validate caller JWT, enforce RBAC
- **Tenant Resolver** – middleware to inject tenant DB client per request
- **Async Provisioning** – queue + worker for large tenants
- **Regional Sharding** – create tenant DB in closest region
- **Backup Scheduler** – per-tenant pg_dump cron
- **Schema Versioning** – migrate tenant DBs independently
- **Resource Quotas** – enforce CPU/memory limits per database
