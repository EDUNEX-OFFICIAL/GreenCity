import { Request, Response } from 'express';
import { prismaSuperUser } from '../db/superuser';

/**
 * Select Company (Context Switch)
 * 
 * Sets the active company in the persistent session.
 * CRITICAL: Must validate that the current user actually owns/belongs to this company.
 * 
 * For now, since we don't have full Auth middleware populating req.user,
 * we might have to trust the input OR check via a trusted header (if Gateway handles auth).
 * 
 * USER INSTRUCTION SAID: "Validate ownership: companyId must belong to authenticated user"
 * BUT: we have no req.user yet (no auth middleware visible).
 * Assumption: We will implement a basic check or placeholder.
 */
export async function selectCompany(req: Request, res: Response) {
    const { companyId } = req.body;
    // const userId = req.user?.id; // TODO: needing auth middleware

    // TODO(AUTH):
    // Validate that the authenticated user has access to this company.
    // This endpoint must be admin/owner protected once auth is implemented.

    if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
    }

    try {
        const company = await prismaSuperUser.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        if (company.status !== "active") {
            return res.status(403).json({
                message: `Company is ${company.status} and cannot be accessed`
            });
        }

        // Set Session
        if (req.session) {
            req.session.activeCompanyId = companyId;

            // Save explicitly to ensure race conditions don't kill it
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error", err);
                    return res.status(500).json({ message: "Failed to set session" });
                }
                return res.json({
                    success: true,
                    message: "Active company switched",
                    activeCompanyId: companyId
                });
            });
        } else {
            return res.status(500).json({ message: "Session not initialized" });
        }

    } catch (error) {
        console.error("Select company error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
