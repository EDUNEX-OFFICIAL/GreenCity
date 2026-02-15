# Project Audit Report: GreenCity
**Date**: 2026-02-05
**Auditor**: Antigravity

## High-Level Verdict
**Status**: 🔴 **RISKY / BROKEN**

The system is currently in a state where runtime errors are guaranteed due to missing database migrations for recent schema changes. Additionally, there is a critical security vulnerability in the seeding logic (plain text passwords), and the onboarding flow ends in a "pending" state indefinitely.

---

## Confirmed Issues

### 1. 🔴 Database Schema Sync (Broken)
**File**: `apps/backend/prisma/superuser.prisma` & `tenant.prisma`
**Problem**:
- New fields have been added to the Prisma schema (`onboardingStatus` in Superuser, `isFirstLogin` & `setupCompleted` in Tenant).
- **NO MIGRATIONS EXIST** for these changes in `apps/backend/prisma/migrations`.
**Impact**:
- The application will crash (or behave unpredictably) when it tries to write to these columns, as they do not exist in the actual PostgreSQL tables.

### 2. 🟠 Service Layer Logic (Partial State)
**File**: `apps/backend/src/services/company.service.ts`
**Problem**:
- The service correctly initializes `onboardingStatus` to `"pending"`.
- However, it **NEVER** updates this status to `"completed"` after the tenant DB is successfully provisioned and seeded.
**Impact**:
- All companies will remain stuck in `"pending"` status forever. The dashboard will likely show them as "Setting up..." indefinitely.

### 3. 🔴 Seed Logic Safety (Critical Security)
**File**: `apps/backend/src/infra/seedTenantDb.ts`
**Line**: ~48 (`passwordHash: rootAdmin.password`)
**Problem**:
- The `rootAdmin` password is being stored in **PLAIN TEXT** in the `User` table.
- Use of the field name `passwordHash` implies it should be hashed, but the raw value is inserted.
**Impact**:
- Critical security vulnerability. If the database is compromised, all root admin passwords are leaked.

### 4. 🟡 Prisma Client Config
**File**: `apps/backend/prisma/tenant.prisma`
**Problem**:
- Uses the default output (writes to `node_modules/@prisma/client`).
- `superuser.prisma` writes to `node_modules/@prisma/superuser-client`.
**Impact**:
- Ensure strict discipline in importing. Integrating `tenant` client into `server.ts` or `app.ts` (which likely import the default client) requires care to ensure the correct "Tenant URL" is passed at runtime. This looks correct in code (`getTenantPrisma(dbUrl)`), but needs to be maintained.

---

## Required Fixes

### Step 1: Generate Missing Migrations
Run the following commands to synchronize the database with your schema changes:

```bash
# For Master DB (Superuser)
npx prisma migrate dev --name add_onboarding_status --schema=apps/backend/prisma/superuser.prisma

# For Tenant DB (Snapshot)
# Note: Since tenant DBs are created dynamically, we need a baseline migration for them.
npx prisma migrate dev --name add_setup_flags --schema=apps/backend/prisma/tenant.prisma
```

### Step 2: Update Service Layer (`company.service.ts`)
Add the completion update at the end of the `try` block:

```typescript
// ... inside createCompanyService try block, after seedTenantDb ...

// STEP 5: Mark onboarding as complete
await prismaSuperUser.company.update({
  where: { id: companyId! },
  data: { onboardingStatus: "completed" }
});

return {
  companyId: company.id,
  dbName,
  message: "Company created successfully",
};
```

### Step 3: Fix Security in Seeding (`seedTenantDb.ts`)
You must hash the password before sending it to the seeder, OR hash it inside the seeder.
**Recommendation**: Hash in `company.service.ts` before calling `seedTenantDb`, or import a hashing util in `seedTenantDb.ts`.

```typescript
// In seedTenantDb.ts
import { hashPassword } from "../utils/auth.util"; // assuming this exists or use bcrypt directly

// ... inside data object ...
passwordHash: await hashPassword(rootAdmin.password), 
```

---

## Verification Checklist

- [ ] **DB**: Verify `Company` table has `onboardingStatus` column.
- [ ] **DB**: Verify `User` table (tenant) has `isFirstLogin` column.
- [ ] **Runtime**: Create a company and check checks `onboardingStatus` transitions to `"completed"`.
- [ ] **Security**: Inspect `User` table in a new tenant DB to ensure `passwordHash` is NOT plain text.
