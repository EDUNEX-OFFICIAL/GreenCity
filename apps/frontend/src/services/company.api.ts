// Shared Types (Inline to avoid mono-repo complexity for now)
export type Company = {
  id: string
  name: string // Backend returns 'name', frontend used 'companyName' in display. Let's map or standardise.
  slug: string
  dbName: string
  status: string
  plan: string
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyInput {
  companyInfo: {
    companyName: string
    email: string
    mobileNumber: string
    addressLine1?: string
    addressLine2?: string
    country: string
    state: string
    district: string
    city: string
    postalCode: string
  }
  rootAdmin: {
    fullName: string
    email: string
    mobileNumber: string
    username: string
    password: string
  }
  subscription: {
    plan: "free" | "pro" | "enterprise"
    conversionId: string
    dsaName?: string
    betaMode?: boolean
  }
}

const API_BASE = process.env.NEXT_BACKEND_API_URL || "http://localhost:5000" // Backend is on 5000

export async function createCompany(payload: CreateCompanyInput): Promise<{ companyId: string }> {
  // Corrected endpoint to match backend route
  const res = await fetch(`${API_BASE}/api/companies/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || "Failed to create company")
  }

  return res.json()
}

export async function listCompanies(): Promise<Company[]> {
  // This endpoint might not exist yet on backend, assuming stub or future implementation. 
  // User said "assume available or stub".
  // Keeping as /api/companies for list is standard REST.
  const res = await fetch(`${API_BASE}/api/companies`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  })

  if (!res.ok) {
    // Return empty array for now if 404 to prevent crash during demo
    return []
  }

  return res.json()
}

export async function selectCompany(companyId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/companies/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to select company");
  }

  return res.json();
}

// ADMIN LIFECYCLE ACTIONS (DEV MODE)
export async function suspendCompany(companyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/companies/${companyId}/suspend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to suspend company");
  }
}

export async function reactivateCompany(companyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/companies/${companyId}/reactivate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to reactivate company");
  }
}

export async function deleteCompany(companyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/companies/${companyId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete company");
  }
}
