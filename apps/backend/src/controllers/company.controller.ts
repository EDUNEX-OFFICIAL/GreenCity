import { Request, Response } from "express";
import { createCompanyService, getAllCompanies } from "../services/company.service";
import { CreateCompanyInput } from "../../types/company";

/**
 * Controller: Create Company
 *
 * Responsibility:
 * - Accept HTTP request
 * - Validate API Contract (Nested Payload)
 * - Pass validated input to service layer
 * - Translate service errors into HTTP responses
 */
export async function createCompany(req: Request, res: Response) {
  try {
    // 1. Explicitly cast body to the expected Nested Contract
    const body = req.body as CreateCompanyInput;

    // 2. Validate essential structure exists
    if (!body.companyInfo || !body.companyInfo.companyName) {
      return res.status(400).json({
        error: "INVALID_PAYLOAD",
        message: "companyInfo.companyName is required",
      });
    }

    if (!body.rootAdmin || !body.rootAdmin.email) {
      return res.status(400).json({
        error: "INVALID_PAYLOAD",
        message: "rootAdmin.email is required"
      });
    }

    if (!body.subscription || !body.subscription.plan) {
      return res.status(400).json({
        error: "INVALID_PAYLOAD",
        message: "subscription.plan is required"
      });
    }

    // 2.1 Validate Location (Strict Mode)
    const { country, state, district, city } = body.companyInfo;
    try {
      // Lazy load validator to avoid circular dep issues if any, though explicit import is better
      const { validateIndianLocation } = require("../validators/location.validator");
      validateIndianLocation(country, state, district, city || ""); 
      // City might be optional in type but required by validator? 
      // strict validator requires city. companyInfo type has city: string.
    } catch (e: any) {
      return res.status(400).json({
        error: "INVALID_LOCATION",
        message: e.message
      });
    }

    // 3. Delegate to service
    // Service now accepts strict nested input
    const result = await createCompanyService(body);

    // Successful creation
    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Company creation failed:", error);

    // Known business error: duplicate company
    if (error.name === "CompanyAlreadyExistsError") {
      return res.status(409).json({
        error: "COMPANY_ALREADY_EXISTS",
        message: error.message,
      });
    }

    // Fallback for unexpected failures
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to create company",
    });
  }
}

/**
 * Controller: List Companies
 * 
 * Responsibility:
 * - Fetch all companies from service
 * - Return list as JSON
 */
export async function listCompanies(req: Request, res: Response) {
  try {
    const companies = await getAllCompanies();
    return res.status(200).json(companies);
  } catch (error) {
    console.error("Failed to list companies:", error);
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch companies",
    });
  }
}
