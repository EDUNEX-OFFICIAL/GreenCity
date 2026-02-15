# Tenant DB Connection: Dynamic Runtime Connectivity

This document details how the GreenCity application connects to individual Tenant Databases in real-time **without** storing their URLs in a `.env` file.

## Core Mechanism: Runtime Construction

The system uses a **Dynamic Connection Strategy**. Instead of reading a static `DATABASE_URL` environment variable for each tenant, it constructs the connection string on-the-fly whenever a request is made.

### 1. The Configuration Source: `POSTGRES_BASE_URL`

The system relies on a single environment variable:
`POSTGRES_BASE_URL=postgresql://user:password@localhost:5432`

This is the **Root URL** of the database server, containing credentials but **no specific database name**.

### 2. The Database Name Source: `Master Database`

The Master Database (`prismaSuperUser`) stores the mapping between a Company and its physical database name.

*   **Table:** `Company`
*   **Field:** `dbName` (e.g., `db_greencity_20231025`)
*   **Lookup:** When a request comes in (e.g., during setup or login), the backend fetches the `Company` record using the company ID (or slug).

### 3. The Connection Factory: `src/db/tenant.ts`

This file exports a factory function, `getTenantPrisma`, which instantiates a fresh Prisma Client for a specific tenant.

```typescript
// src/db/tenant.ts
export function getTenantPrisma(dbUrl?: string) {
  return new PrismaClientTenant({
    datasources: {
      db: { url: dbUrl }, // 👈 Dynamic URL Injection
    },
  });
}
```

### 4. The Runtime Flow (Example: `updateSettings`)

When `onboarding.service.ts` needs to save data to a tenant's DB:

1.  **Fetch Metadata:** It queries the Master DB for the company's `dbName`.
    ```typescript
    const masterCompany = await prismaSuperUser.company.findUnique({ where: { id: companyId } });
    ```
2.  **Construct URL:** It combines the Base URL and the DB Name.
    ```typescript
    const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
    ```
3.  **Instantiate Client:** It calls the factory with the constructed URL.
    ```typescript
    const tenantPrisma = getTenantPrisma(dbUrl);
    ```
4.  **Execute & Disconnect:** It runs the query and then (typically) lets the client be garbage collected or disconnects explicitly (though in serverless/long-running apps, connection pooling management is key here).

### 5. Infrastructure Operations (Migrations)

For operations outside the running app, like migrations, a similar approach is used in `infra/migrateTenantDb.ts`:

1.  It constructs `tenantDbUrl` exactly like the service layer.
2.  It spawns a child process for Prisma CLI.
3.  It **injects** the constructed URL into the child process's environment as `DATABASE_URL`.

```typescript
// infra/migrateTenantDb.ts
await execa("npx", ["prisma", "migrate", "deploy", ...], {
  env: {
    ...process.env,
    DATABASE_URL: tenantDbUrl, // 👈 Injected into Child Process
  },
});
```

## Summary

*   **No .env bloat:** You do not have thousands of env vars for thousands of tenants.
*   **Security:** Credentials are centralized in the Base URL (or managed via vault in future).
*   **Isolation:** The code explicitly connects only to the target DB.
*   **Scalability:** The application works for any number of databases without restart or configuration change.
