import { PrismaClient } from "../generated/tenant-client";

/**
 * 🔒 Helper Utility
 * Validates that a value is a non-empty string after trimming.
 */
function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 🟢 PHASE 3 — Optimize State Checking
 * Validates dependencies for a specific step without fetching unnecessary data.
 */
export async function validateStepPrerequisite(
  tenantPrisma: PrismaClient, 
  targetStep: 'additionalInfo' | 'legal' | 'accounting' | 'branch' | 'complete'
) {
  
  // 1. General Info is the base for EVERYTHING.
  // We explicitly check field presence AND content.
  const profile = await tenantPrisma.companyProfile.findFirst();
  
  const isGeneralInfoComplete = 
    !!profile &&
    isNonEmptyString(profile.companyName) &&
    isNonEmptyString(profile.email) && // critical contact info
    // Mobile might be optional or numeric-string depending on region? 
    // Prompt said "mobile (if string)". Schema says String. Let's enforce it.
    isNonEmptyString(profile.mobile) && 
    isNonEmptyString(profile.country) && // critical location info
    isNonEmptyString(profile.state);

  if (!isGeneralInfoComplete) {
    throw new Error("Setup Incomplete: General Information (Step 1) is missing or incomplete.");
  }

  // If target is just 'additionalInfo' or 'legal', we are good (Sequence: General -> Additional/Legal)
  if (targetStep === 'additionalInfo' || targetStep === 'legal') {
    return;
  }

  // 2. Legal Info Check (Required for Accounting)
  const compliance = await tenantPrisma.complianceDetails.findFirst();
  const isLegalComplete = 
    !!compliance &&
    // At least one tax ID must be present AND valid
    (isNonEmptyString(compliance.gstin) || isNonEmptyString(compliance.pan) || isNonEmptyString(compliance.tan));

  if (!isLegalComplete) {
     throw new Error("Setup Incomplete: Legal Information (Step 3) is missing.");
  }

  if (targetStep === 'accounting') {
    return;
  }

  // 3. Accounting Check (Required for Branch/Complete)
  const financial = await tenantPrisma.financialPeriod.findFirst();
  const isAccountingComplete = 
    !!financial &&
    !!financial.financialYearFrom && // Date object, so !! check is fine (not string)
    isNonEmptyString(financial.baseCurrency);

  if (!isAccountingComplete) {
    throw new Error("Setup Incomplete: Accounting Configuration (Step 4) is missing.");
  }

  if (targetStep === 'branch') {
    return;
  }

  // 4. Branch Check (Required for Complete)
  const branch = await tenantPrisma.branch.findFirst({
    where: { isHeadOffice: true }
  });
  const isBranchComplete = 
    !!branch &&
    isNonEmptyString(branch.name) &&
    isNonEmptyString(branch.country);

  if (!isBranchComplete) {
    throw new Error("Setup Incomplete: Head Office Branch (Step 5) is missing.");
  }

  // If we got here for 'complete', all dependencies are met.
}

/**
 * 🟢 PHASE 4 — Hardened State Retrieval
 * Returns the full state state for UI/Debugging/Verification
 */
export async function getOnboardingState(tenantPrisma: PrismaClient) {
  const profile = await tenantPrisma.companyProfile.findFirst();
  const compliance = await tenantPrisma.complianceDetails.findFirst();
  const financial = await tenantPrisma.financialPeriod.findFirst();
  const branch = await tenantPrisma.branch.findFirst({
    where: { isHeadOffice: true }
  });

  return {
    generalInfoComplete: 
      !!profile && 
      isNonEmptyString(profile.companyName) && 
      isNonEmptyString(profile.email) &&
      isNonEmptyString(profile.mobile) &&
      isNonEmptyString(profile.country) &&
      isNonEmptyString(profile.state),
    
    legalComplete: 
      !!compliance && 
      (isNonEmptyString(compliance.gstin) || isNonEmptyString(compliance.pan) || isNonEmptyString(compliance.tan)),
    
    accountingComplete: 
      !!financial && 
      !!financial.financialYearFrom &&
      isNonEmptyString(financial.baseCurrency),
      
    branchComplete: 
      !!branch && 
      branch.isHeadOffice === true &&
      isNonEmptyString(branch.name) &&
      isNonEmptyString(branch.country)
  };
}
