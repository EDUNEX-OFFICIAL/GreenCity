import { prismaSuperUser } from "../../db/superuser";

// Allowed fields for update
type UpdateCompanyInput = {
    name?: string;
    plan?: string;
};

/**
 * Service: Admin Company Lifecycle Management
 * Operating on Master DB only.
 */

/**
 * Update Company Details
 * Restricts updates to safe fields (name, plan).
 */
export async function updateCompany(companyId: string, data: UpdateCompanyInput) {
    const company = await prismaSuperUser.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        throw new Error("Company not found");
    }

    // Prevent updates to deleted companies
    if (company.status === "deleted") {
        throw new Error("Cannot update a deleted company");
    }

    return await prismaSuperUser.company.update({
        where: { id: companyId },
        data: {
            name: data.name,
            plan: data.plan,
        },
    });
}

/**
 * Suspend Company
 * Transition: active -> suspended
 */
export async function suspendCompany(companyId: string) {
    const company = await prismaSuperUser.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        throw new Error("Company not found");
    }

    if (company.status !== "active") {
        throw new Error(`Cannot suspend company. Current status: ${company.status}`);
    }

    return await prismaSuperUser.company.update({
        where: { id: companyId },
        data: { status: "suspended" },
    });
}

/**
 * Reactivate Company
 * Transition: suspended -> active
 */
export async function reactivateCompany(companyId: string) {
    const company = await prismaSuperUser.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        throw new Error("Company not found");
    }

    if (company.status !== "suspended") {
        throw new Error(`Cannot reactivate company. Current status: ${company.status}`);
    }

    return await prismaSuperUser.company.update({
        where: { id: companyId },
        data: { status: "active" },
    });
}

/**
 * Soft Delete Company
 * Transition: * -> deleted (unless already deleted)
 * Does NOT drop tenant DB or delete rows.
 */
export async function softDeleteCompany(companyId: string) {
    const company = await prismaSuperUser.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        throw new Error("Company not found");
    }

    if (company.status === "deleted") {
        throw new Error("Company is already deleted");
    }

    return await prismaSuperUser.company.update({
        where: { id: companyId },
        data: { status: "deleted" },
    });
}
