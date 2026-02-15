import { Router } from "express";
import {
    getOnboardingData,
    updateCompanyInfo,
    updateAdminInfo,
    updateSettings,
    completeOnboarding,
    getMe,
    updateBranchInfo,
    updateLegalInfo,
    updateAccountingInfo,
    getSetupStatus
} from "../controllers/onboarding.controller";
import { tenantMiddleware } from "../middlewares/tenant.middleware";

const router = Router();

// STRICT: All onboarding routes require tenant context
router.use(tenantMiddleware);

router.get("/data", getOnboardingData);
router.put("/company", updateCompanyInfo);
router.put("/admin", updateAdminInfo);
router.put("/settings", updateSettings); // generic/legacy or for additional-info
router.post("/branch", updateBranchInfo); // New
router.post("/legal", updateLegalInfo); // New
router.post("/accounting", updateAccountingInfo); // New
router.get("/status", getSetupStatus); // New
router.post("/complete", completeOnboarding);
router.get("/me", getMe);


export default router;
