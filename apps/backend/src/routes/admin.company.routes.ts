import { Router } from "express";
import * as adminController from "../controllers/admin/company.admin.controller";

const router = Router();

// Base: /api/admin/companies

// Update company details (name, plan)
router.patch("/:companyId", adminController.updateCompany);

// Suspend company
router.post("/:companyId/suspend", adminController.suspendCompany);

// Reactivate company
router.post("/:companyId/reactivate", adminController.reactivateCompany);

// Soft delete company
router.delete("/:companyId", adminController.softDeleteCompany);

export default router;
