# Setup Pages Flow Documentation

This document outlines the architecture and flow of the "Setup Wizard" for the GreenCity application. It details how the frontend pages interact with the backend APIs and how data is persisted across the Master and Tenant databases.

## 1. Overview

The Setup Wizard is a step-by-step onboarding process for new companies. It ensures that critical information (Company Profile, Admin, Legal, Accounting, Branch) is collected and validated before the company accounts are fully active.

### Key Components:
- **Frontend**: Next.js (App Router), `SetupContext`, `SetupStepIndicator`.
- **Backend**: Express.js, `OnboardingService`, Prisma (Multi-tenant).
- **Database**:
    - **Master DB**: Manages Company existence and connection strings.
    - **Tenant DB**: Stores actual company data (Profile, Users, Settings, etc.).

---

## 2. Frontend Architecture

### Location
- **Pages**: `apps/frontend/src/app/(dashboard)/setup/*`
- **Context**: `apps/frontend/src/context/SetupContext.tsx`
- **Components**: `apps/frontend/src/components/onboarding/*`
- **API Service**: `apps/frontend/src/services/onboarding.api.ts`

### Route Structure
The setup process is divided into 5 sequential steps, managed by `SetupLayout` and `SetupStepIndicator`.

| Step | Page Path | Description |
| :--- | :--- | :--- |
| **1. General Info** | `/setup/general-info` | Company Basic Details & Root Admin Info |
| **2. Additional Info** | `/setup/additional-info` | Business Type, Links, Support Contacts (stored in Settings JSON) |
| **3. Legal Info** | `/setup/legal-info` | GST, PAN, TAN, and Compliance Details |
| **4. Accounting** | `/setup/accounting-configuration` | Fiscal Year, Currency, Invoice Prefixes |
| **5. Branch Info** | `/setup/branch-info` | Head Office logic & Stock Rules |

### State Management & Navigation Guard
- **`SetupStepIndicator.tsx`**:
    - Fetches current progress via `/api/onboarding/data`.
    - Reads `settings.settingsJson.completedSteps` to determine which steps are done.
    - **Locking Mechanism**: Prevents navigation to future steps if previous steps are incomplete. It redirects users back to the first incomplete step.

---

## 3. Backend Architecture

### Location
- **Routes**: `apps/backend/src/routes/onboarding.routes.ts`
- **Controller**: `apps/backend/src/controllers/onboarding.controller.ts`
- **Service**: `apps/backend/src/services/onboarding.service.ts`
- **Service**: `apps/backend/src/services/onboarding.service.ts`
- **Validators**: 
    - `apps/backend/src/validators/onboarding.validator.ts` (Input Validation)
    - `apps/backend/src/validators/onboardingState.validator.ts` (State & Sequence Enforcement)

### API Endpoints
All endpoints are prefixed with `/api/onboarding` and require **Tenant Context** (derived from the authenticated user's session/subdomain).

| Method | Endpoint | Purpose | Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/data` | Fetches pre-filled data for all steps to populate the UI. | - |
| `PUT` | `/company` | Updates `CompanyProfile` (Step 1). | `{ companyName, email, mobile, address... }` |
| `PUT` | `/admin` | Updates `User` (Step 1). | `{ fullName, email, mobile }` |
| `PUT` | `/settings` | Updates `CompanySettings` (Step 2 - Additional Info). | `{ stepKey: "additionalInfo", data: { ... } }` |
| `POST` | `/legal` | Upserts `ComplianceDetails` (Step 3). | `{ gstin, pan, tan, msme... }` |
| `POST` | `/accounting` | Upserts `FinancialPeriod` (Step 4). | `{ financialYearStart, baseCurrency... }` |
| `POST` | `/branch` | Upserts Head Office `Branch` (Step 5). | `{ branchName, workingDays... }` |
| `GET` | `/status` | Returns completion status for all steps. | - |
| `POST` | `/complete` | Finalizes setup, unlocks user, and marks status as 'completed'. | - |

---

## 4. Data Persistence & Logic

The `OnboardingService` handles the complex logic of writing to two different databases.

### 4.1 Master DB Interaction
- The service first checks the **Master DB** (`prismaSuperUser.company`) using the `companyId` attached to the request.
- It retrieves the `dbName` to dynamically connect to the correct **Tenant DB**.

### 4.2 Tenant DB Interaction
Once connected to the Tenant DB, the service updates specific tables based on the step.

| Step | Table(s) Affected | Notes |
| :--- | :--- | :--- |
| **General Info** | `CompanyProfile`, `User` | Updates the main profile and the root admin user. |
| **Additional Info** | `CompanySettings`, `CompanyProfile` | **Hybrid Strategy**: Writes structured data to `CompanyProfile` where columns exist, and legacy data to `CompanySettings.settingsJson.additionalInfo` to maintain backward compatibility. |
| **Legal Info** | `ComplianceDetails` | Creates or updates the single compliance record. |
| **Accounting** | `FinancialPeriod` | Sets up the first financial year and invoice prefixes. |
| **Branch Info** | `Branch` | Upserts the **Head Office** branch (identified by `isHeadOffice: true`). |
| **Progress** | `CompanySettings` | Updates `settingsJson.completedSteps` (e.g., `{ "legalInfo": true }`) after every successful save. |

### 4.3 Completion Flow (`/complete`)
**CRITICAL**: This endpoint is the **Final Gatekeeper**.
1.  **Validate Tenant State**: The backend re-validates the entire chain (`General` -> `Legal` -> `Accounting` -> `Branch`) by querying the Tenant DB directly.
    -   It does **NOT** trust the frontend.
    -   It does **NOT** trust the `settingsJson.completedSteps` flag.
    -   It does **NOT** trust the Master DB's `onboardingStatus` (until tenant state is proven valid).
2.  **Unlock User**: Sets `isFirstLogin = false` for all tenant users.
3.  **Update Tenant Status**: Sets `settingsJson.setupCompleted = true` in the Tenant DB.
4.  **Update Master Status**: Sets `Company.onboardingStatus = 'completed'` in the Master DB.

---

## 5. Security & Validation (New)

The backend now enforces a **Strict Sequential Dependency Model**:

1.  **State Authority**: The Tenant Database is the single source of truth.
2.  **Sequential Enforcement**:
    -   You cannot save **Legal Info** unless **General Info** is complete.
    -   You cannot save **Accounting** unless **Legal Info** is complete.
    -   You cannot save **Branch** unless **Accounting** is complete.
    -   You cannot **Complete** setup unless **Branch** (and all prior steps) are complete.
3.  **Field Validation**:
    -   All required string fields (e.g., `companyName`, `gstin`) must be **non-empty** and **trimmed**. Whitespace-only values are rejected.
4.  **Legacy Data**:
    -   `settingsJson.completedSteps` is updated for **UI convenience only**. The backend ignores it for permission checks.

---

## 5. Summary of Flow

1.  **User Login**: User logs in and is redirected to `/setup/general-info` if `isFirstLogin` is true.
2.  **Step 1 (General)**: User fills form -> `PUT /company` & `PUT /admin`. Backend updates Profile & User.
3.  **Navigation**: Frontend checks completion. If Step 1 saved, unlocks Step 2.
3.  **Navigation**: Frontend checks completion. If Step 1 saved, unlocks Step 2.
4.  **Steps 2-5**: User proceeds linearly. Each step calls its respective API (`/legal`, `/accounting`, etc.).
    -   **Backend Check**: The backend verifies that the *previous* step exists in the DB before allowing the save.
    -   **Progress**: Backend updates `completedSteps` (UI flag) only after successful save.
5.  **Finalize**: User clicks "Finish Setup" -> `POST /complete`.
6.  **Redirect**: User is redirected to the main Dashboard.
