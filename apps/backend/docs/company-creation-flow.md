# Company Creation Flow Audit

This report details the sequential flow of creating a company in the GreenCity application, tracing the execution from the Frontend UI to the Backend Database provisioning.

## 1. Frontend: User Interface & Data Collection

**Entry Point:** `apps/frontend/src/app/(dashboard)/companies/client.tsx`
- **Action:** User clicks "Add Company" button.
- **Component:** Opens `CompanyCreateModel` modal.

**Form:** `apps/frontend/src/components/models/CompanyCreateModel.tsx`
- **Steps:**
    1.  **Company Info:** Name, Email, Mobile, Address (Country, State, District, Zip).
    2.  **Root Admin:** Name, Email, Mobile, Username, Password.
    3.  **Subscription:** Plan (Free/Pro/Ent), Conversion ID, Beta Mode toggle.
- **Validation:** Internal state validation prevents proceeding if fields are missing/invalid.
- **Submission:** On final step, calls `onSubmit(formData)`.

**API Service:** `apps/frontend/src/services/company.api.ts`
- **Function:** `createCompany(payload)`
- **Request:** Sends `POST` request to `/api/companies/create`.
- **Payload:** `CreateCompanyInput` (nested JSON structure).

---

## 2. Backend: API Routing & Control

**Route Definition:** `apps/backend/src/routes/company.routes.ts`
- **Endpoint:** `POST /companies/create`
- **Handler:** Maps to `createCompany` controller.

**Controller:** `apps/backend/src/controllers/company.controller.ts`
- **Function:** `createCompany(req, res)`
- **Validation:**
    - Casts `req.body` to `CreateCompanyInput`.
    - Performs basic null checks on critical fields (`companyName`, `rootAdmin.email`, `plan`).
    - Returns `400 Bad Request` if validation fails.
- **Delegation:** Calls `createCompanyService(body)`.
- **Response:**
    - `201 Created` on success (returns `companyId`, `dbName`).
    - `409 Conflict` if company already exists (caught from service error).
    - `500 Internal Server Error` for other failures.

---

## 3. Backend: Core Business Logic & Infrastructure

**Service:** `apps/backend/src/services/company.service.ts`
- **Function:** `createCompanyService(input)`
- **Logic:**
    1.  **Uniqueness:** Checks Master DB for existing `slug` (derived from company name). Throws `CompanyAlreadyExistsError` if found.
    2.  **Master Record:** Creates a `Company` record in the **Master Database** (`prismaSuperUser`) with `status: "pending"`.
    3.  **Naming:** Generates a deterministic Tenant DB Name: `db_<slug>_<timestamp>_<idSuffix>`.
    4.  **Provisioning:** Calls infrastructure helpers to setup the physical database.
    5.  **Rollback:** Uses a `try/catch` block. If any step fails, it attempts to drop the Tenant DB and delete the Master DB record to ensure atomicity.

**Infrastructure Helpers:** `apps/backend/infra/`

1.  **Database Creation:** `createTenantDb.ts`
    - Validates DB name format (security against injection).
    - Connects to Postgres using `pg` client.
    - Executes `CREATE DATABASE <dbName>`.

2.  **Schema Migration:** `migrateTenantDb.ts`
    - Constructs the connection string for the NEW tenant DB.
    - Spawns a child process (`execa`) to run:
        `npx prisma migrate deploy --schema=prisma/tenant/schema.prisma`
    - This applies the Tenant Schema (Tables: `User`, `CompanyProfile`, `Permission`, etc.) to the new empty DB.

3.  **Data Seeding:** `seedTenantDb.ts`
    - Connects to the new Tenant DB using `getTenantPrisma`.
    - **Inserts:**
        - `CompanyProfile`: From form input.
        - `User`: The Root Admin (password is hashed in service layer before passing here).
        - `Permission`: Default system permissions.
        - `CompanySettings`: Initial settings (e.g., `setupCompleted: false`).

---

## 4. Database Layer

**Master Database:** `prisma/superuser/schema.prisma`
- Table: `Company`
- Stores: `id`, `name`, `slug`, `dbName` (connection string ref), `status`, `plan`.

**Tenant Database:** `prisma/tenant/schema.prisma`
- Tables: `CompanyProfile`, `User`, `Role`, `Permission`, `CompanySettings`, `Branch`, etc.
- **Isolation:** Each company has its own completely separate PostgreSQL database.
