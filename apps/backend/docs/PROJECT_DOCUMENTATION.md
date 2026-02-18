# Green-City SaaS ERP - Project Documentation

**Generated Date:** 2026-02-18
**Version:** 0.1.0 (Pre-Alpha / Foundation Phase)

## 1. Executive Summary
Green-City is an enterprise-grade, multi-tenant SaaS ERP platform designed for high scalability and strict data isolation. It uses a **Database-per-Tenant** architecture, ensuring that each client's data resides in a completely isolated PostgreSQL database.

The project is currently in the **Foundation & Onboarding Phase**. The core infrastructure for multi-tenancy, authentication, and tenant provisioning is built, but specific ERP modules (Accounting, Inventory, generic business logic) have not yet been implemented.

---

## 2. Technical Stack

### Monorepo Structure (Turborepo)
*   **Packet Manager**: `pnpm`
*   **Build System**: `turbo`

### Frontend (`apps/frontend`)
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4
*   **State Management**: React Hooks / Server Actions
*   **UI Components**: React 19, Lucide Icons, Framer Motion
*   **Forms**: `react-hook-form` + `zod`

### Backend (`apps/backend`)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **ORM**: Prisma (Dynamic Schema Management)
*   **Database**: PostgreSQL
*   **Containerization**: Docker

---

## 3. Architecture & Multi-Tenancy

The system employs a strict separation between the **Control Plane** and the **Data Plane**.

### Control Plane (`db_master`)
*   **Purpose**: Manages system-wide configuration, tenant registry, and billing.
*   **Key Models**:
    *   `Company`: Stores tenant metadata (`slug`, `dbName`, `status`).
    *   `SuperUser`: Platform administrators.
    *   `TenantEvent`: Audit logs for provisioning.
*   **Schema**: `apps/backend/prisma/superuser/schema.prisma`

### Data Plane (`db_<tenant_name>`)
*   **Purpose**: Stores actual business data for a specific tenant.
*   **Isolation**: Each tenant has a dedicated PostgreSQL database.
*   **Key Models**:
    *   `CompanyProfile`: Business details.
    *   `Branch`: Multi-branch support.
    *   `FinancialPeriod`: Fiscal year and accounting settings.
    *   `User`: Tenant-specific employees/users.
    *   `Role` / `Permission`: RBAC.
*   **Schema**: `apps/backend/prisma/tenant/schema.prisma`

### Request Flow
1.  **Frontend**: User logs in or accesses a page.
2.  **Middleware**: `tenantMiddleware` in Express resolves the tenant based on the request (header or subdomain).
3.  **Backend**:
    *   Connects to `db_master` to validate the tenant.
    *   Dynamically instantiates a Prisma Client for the specific `db_<tenant>`.
4.  **Database**: Query is executed against the isolated tenant database.

---

## 4. Current Development Status

| Feature Area | Status | Notes |
| :--- | :--- | :--- |
| **Infrastructure** | 🟢 **Complete** | Monorepo setup, Docker linting, build pipeline. |
| **Multi-Tenancy** | 🟢 **Complete** | Dynamic DB provisioning, schema isolation, routing. |
| **Authentication** | 🟡 **Partial** | User model exists, basic auth flow present. |
| **Onboarding** | 🟢 **Complete** | Multi-step wizard fully implemented (Company -> Branch -> Legal -> Accounting). |
| **Company Mgmt** | 🟢 **Complete** | Create, List, Switch, Suspend/Reactivate tenants. |
| **Accounting** | 🔴 **Not Started** | Only `FinancialConfiguration` exists. No Ledger, Journal, or Reporting. |
| **Inventory** | 🔴 **Not Started** | No schema or logic. |
| **HR/Payroll** | 🔴 **Not Started** | No schema or logic. |

---

## 5. Detailed Feature Breakdown

### A. Tenant Onboarding (Setup Wizard)
The project features a robust, multi-step onboarding wizard for new tenants. This is the most mature feature currently.

**Frontend Path**: `apps/frontend/src/app/(dashboard)/setup`
**API Routes**: `/api/onboarding/*`

**Steps:**
1.  **General Info**: Company name, address (managed via `updateCompanyInfo`).
2.  **Branch Info**: Head office details (managed via `updateBranchInfo`).
3.  **Legal Info**: Compliance details like GST, PAN, CIN (managed via `updateLegalInfo`).
4.  **Accounting Configuration**: Fiscal year, base currency, accounting method (managed via `updateAccountingInfo`).
5.  **Completion**: Finalizes setup and marks tenant as active (`completeOnboarding`).

### B. Company Management
Allows users (and admins) to manage their tenant instances.

**Frontend Path**: `apps/frontend/src/app/(dashboard)/companies`
**API Routes**: `/api/companies/*`

**Capabilities:**
*   **Create Company**: Provisions a new `db_<tenant>` and runs migrations.
*   **List Companies**: Shows all companies the user has access to.
*   **Select Company**: Switches the active session context.

### C. Admin Administration
Superadmin features to manage the platform.

**API Routes**: `/api/admin/companies/*`

**Capabilities:**
*   Suspend / Reactivate Tenants.
*   Update Tenant Plans.
*   Soft Delete Tenants.

---

## 6. Folder Structure Overview

```
green-city/
├── apps/
│   ├── frontend/               # Next.js Application
│   │   ├── src/app/(dashboard) # Main App Routes
│   │   │   ├── companies/      # Company List/Create UI
│   │   │   ├── dashboard/      # Main Landing Dashboard
│   │   │   └── setup/          # Onboarding Wizard Steps
│   │   └── src/components/     # UI Components
│   │
│   └── backend/                # Express Application
│       ├── prisma/             # Database Schemas
│       │   ├── superuser/      # Control Plane Schema
│       │   └── tenant/         # Data Plane Schema
│       ├── src/
│       │   ├── controllers/    # Request Handlers
│       │   ├── routes/         # API Endpoint Definitions
│       │   ├── services/       # Business Logic
│       │   └── middlewares/    # Tenant Resolution & Auth
```

## 7. Next Steps & Recommendations

Since the foundation is solid, the next phase of development should focus on **Core ERP Modules**:

1.  **Accounting Module**:
    *   Design schema for `ChartOfAccounts`, `JournalEntry`, `Ledger`.
    *   Implement APIs for recording transactions.
2.  **Inventory Module**:
    *   Design schema for `Item`, `Warehouse`, `StockMovement`.
3.  **Dashboard Analytics**:
    *   Replace the placeholder dashboard with actual metrics (e.g., active branches, setup progress).

---
