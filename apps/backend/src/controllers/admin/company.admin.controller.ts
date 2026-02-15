import { Request, Response } from "express";
import * as adminService from "../../services/admin/company.admin.service";

// TODO(AUTH):
// These endpoints must be protected by authentication and admin roles.
// Currently exposed for development/testing only.

export async function updateCompany(req: Request, res: Response) {
    const companyId = req.params.companyId as string;
    const { name, plan } = req.body;

    try {
        const updated = await adminService.updateCompany(companyId, { name, plan });
        return res.json({
            message: "Company updated successfully",
            company: updated,
        });
    } catch (error: any) {
        const status = error.message === "Company not found" ? 404 : 400;
        return res.status(status).json({
            error: "UPDATE_FAILED",
            message: error.message,
        });
    }
}

export async function suspendCompany(req: Request, res: Response) {
    const companyId = req.params.companyId as string;

    try {
        const updated = await adminService.suspendCompany(companyId);
        return res.json({
            message: "Company suspended successfully",
            company: updated,
        });
    } catch (error: any) {
        const status = error.message === "Company not found" ? 404 : 400;
        return res.status(status).json({
            error: "SUSPEND_FAILED",
            message: error.message,
        });
    }
}

export async function reactivateCompany(req: Request, res: Response) {
    const companyId = req.params.companyId as string;

    try {
        const updated = await adminService.reactivateCompany(companyId);
        return res.json({
            message: "Company reactivated successfully",
            company: updated,
        });
    } catch (error: any) {
        const status = error.message === "Company not found" ? 404 : 400;
        return res.status(status).json({
            error: "REACTIVATE_FAILED",
            message: error.message,
        });
    }
}

export async function softDeleteCompany(req: Request, res: Response) {
    const companyId = req.params.companyId as string;

    try {
        const updated = await adminService.softDeleteCompany(companyId);
        return res.json({
            message: "Company deleted (soft) successfully",
            company: updated,
        });
    } catch (error: any) {
        const status = error.message === "Company not found" ? 404 : 400;
        return res.status(status).json({
            error: "DELETE_FAILED",
            message: error.message,
        });
    }
}
