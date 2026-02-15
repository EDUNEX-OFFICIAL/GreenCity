import { Request, Response, NextFunction } from 'express';
import { prismaSuperUser } from '../db/superuser';

// Extend Express Request type to include companyId
declare global {
    namespace Express {
        interface Request {
            companyId?: string;
        }
    }
}

// Extended Express Request type is already declared in global, 
// but we need to ensure SessionData is extended if we use req.session.activeCompanyId
declare module 'express-session' {
    interface SessionData {
        activeCompanyId?: string;
    }
}

/**
 * Tenant Context Middleware
 * 
 * RESPONSIBILITY:
 * 1. Resolve companyId from Session (Trusted Source)
 * 2. Fallback to Header/Query for INITIAL selection (must be validated by controller later usually, 
 *    but here we might just allow it to bootstrap the session if valid).
 * 3. STRICT: If no session and no valid input -> 400/401.
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
    // 1. Session is Truth
    if (req.session && req.session.activeCompanyId) {
        const companyId = req.session.activeCompanyId;

        try {
            // Validate against Master DB
            const company = await prismaSuperUser.company.findUnique({
                where: { id: companyId }
            });

            if (!company) {
                return res.status(403).json({
                    error: "ACCESS_DENIED",
                    message: "Company not found or inaccessible"
                });
            }

            // Invariant: Tenant access is allowed ONLY for active companies.
            // Suspended or deleted companies must be blocked globally.
            if (company.status !== 'active') {
                return res.status(403).json({
                    error: "ACCESS_DENIED",
                    message: `Company is ${company.status} and access is blocked`
                });
            }

            // Valid & Active
            req.companyId = companyId;
            return next();

        } catch (error) {
            console.error("Tenant validation failed:", error);
            return res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "Failed to validate tenant context"
            });
        }
    }

    // 2. Strict Session Enforcement
    // We do NOT accept headers or query params here. source of truth is session.
    // If you need to set the session, use POST /api/companies/select

    // 3. No Context
    return res.status(400).json({
        error: "MISSING_TENANT_CONTEXT",
        message: "No active company session. Please select a company."
    });
}
