import { Company } from "./company.api";

export interface CompanyProfileUpdate {
    id: string;
    companyName: string;
    email: string;
    mobile: string;
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    district: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface AdminUpdate {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
}

export interface SettingsUpdate {
    id: string;
}

export interface OnboardingData {
    companyProfile: {
        id: string;
        companyName: string;
        email: string;
        mobile: string;
        addressLine1?: string;
        addressLine2?: string;
        city: string;
        district: string;
        state: string;
        country: string;
        postalCode: string;
        plan: string;
    };
    admin: {
        id: string;
        fullName: string;
        email: string;
        mobile: string;
        username: string;
        password?: string;
    };
    settings: any;
    branches: any[];
    onboardingStatus: string;
}

export async function getOnboardingData(): Promise<OnboardingData> {
    const res = await fetch(`/api/onboarding/data`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch onboarding data");
    }

    return res.json();
}

export async function updateCompanyInfo(data: CompanyProfileUpdate) {
    const res = await fetch(`/api/onboarding/company`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update company info");
    }

    return res.json();
}

export async function updateAdminInfo(data: AdminUpdate) {
    const res = await fetch(`/api/onboarding/admin`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update admin info");
    }

    return res.json();
}

export interface SettingsUpdatePayload {
    stepKey: string;
    data: any;
}

export async function updateSettings(data: SettingsUpdatePayload) {
    const res = await fetch(`/api/onboarding/settings`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update settings");
    }

    return res.json();
}



export async function updateBranchInfo(data: any) {
    const res = await fetch(`/api/onboarding/branch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update branch info");
    }

    return res.json();
}

export async function updateLegalInfo(data: any) {
    const res = await fetch(`/api/onboarding/legal`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update legal info");
    }

    return res.json();
}

export async function updateAccountingInfo(data: any) {
    const res = await fetch(`/api/onboarding/accounting`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update accounting info");
    }

    return res.json();
}

export async function completeOnboarding() {
    const res = await fetch(`/api/onboarding/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to complete onboarding");
    }

    return res.json();
}
