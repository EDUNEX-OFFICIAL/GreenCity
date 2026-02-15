# Multi-Tenant Migration Architecture & Policy

This document outlines the architecture for managing schema changes across the GreenCity multi-tenant ecosystem. It is mandatory to follow this flow for any database modification.

## 🏛️ Architectural Context

GreenCity uses a **Database-per-Tenant** strategy. 
- **SuperUser Database**: Global metadata, company registration, and tenant routing.
- **Tenant Databases**: Isolated business logic, profiles, and transactions.

Because tenant databases are provisioned at runtime based on the `POSTGRES_BASE_URL` and `company.dbName`, standard Prisma migration commands (`npx prisma migrate deploy`) executed against the root `.env` will only affect the Master/SuperUser database.

## 🛡️ Persistence Principles

### 1. Structure over Blobs
All operational data (e.g., Legal Name, Company Type, Incorporation Date) MUST be stored as **structured columns** in the appropriate model (e.g., `CompanyProfile`). 

> [!IMPORTANT]
> Use `settingsJson` ONLY for non-relational UI state or experimental feature flags. Do not store audit-critical or reporting-critical data in JSON blobs.

### 2. Backward Compatibility
When migrating data from a JSON blob to a column:
1.  **Read Strategy**: Implement a fallback in the service (`new_column || legacy_json_field`).
2.  **Write Strategy**: Update the service to write ONLY to the new column.
3.  **Clean-up**: Data backfill is encouraged but not strictly required if the fallback logic is robust.

## 🚀 The Multi-Tenant Migration Workflow

### Step 1: Update the Tenant Schema
Modify `apps/backend/prisma/tenant/schema.prisma`.

### Step 2: Generate Migration Metadata
Run the following to generate the SQL migration file in the `prisma/tenant/migrations` folder:
```bash
npx prisma migrate dev --create-only --schema=prisma/tenant/schema.prisma --name your_migration_name
```

### Step 3: Global Deployment
Execute the migration orchestrator script. This script fetches all active tenants and applies the pending migrations to each individual database.

```bash
# From apps/backend
npx tsx scripts/deploy-tenant-migration.ts
```

## 🔧 Script: `deploy-tenant-migration.ts`
This script uses a dedicated SuperUser Prisma Client to fetch the fleet state and then spawns individual `prisma migrate deploy` processes with dynamic `DATABASE_URL` injection.

### Reliability Features:
- **Environment Isolation**: Uses `POSTGRES_BASE_URL` to reconstruct tenant connection strings.
- **Fail-Fast**: The script exits if any single tenant migration fails, preventing a "split-brain" state in the fleet.
- **Cross-Platform**: Uses `child_process.spawn` with `.cmd` detection for Windows compatibility.

---

*Last Updated: February 2026*
