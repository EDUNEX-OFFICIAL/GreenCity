import { Router } from "express";
import { createCompany, listCompanies } from "../controllers/company.controller";
import { selectCompany } from "../controllers/company.select.controller";

const router = Router();

router.post("/companies/create", createCompany);
router.get("/companies", listCompanies);
router.post("/companies/select", selectCompany);

export default router;
