import { getTenantPrisma } from "../db/tenant";
import { prismaSuperUser } from "../db/superuser";
import { validateStepPrerequisite, getOnboardingState } from "../validators/onboardingState.validator";



export async function getMe(companyId: string) {
  // STRICT: Use findUnique with companyId
  const company = await prismaSuperUser.company.findUnique({
    where: { id: companyId }
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const tenantDbUrl = `${process.env.POSTGRES_BASE_URL}/${company.dbName}`;
  const tenantPrisma = getTenantPrisma(tenantDbUrl);

  // We still need to find the USER in the tenant DB.
  // Ideally, this should also be by ID if we had auth. 
  // For now, finding "some" user (likely the admin/owner) is consistent 
  // with previous logic, BUT likely safer to assume single-user-per-tenant 
  // for this specific 'setup' phase or we need userId.
  // User prompt said "Until full authentication...".
  // The logic below was finding *a* user. We will keep that for now 
  // as the prompt focused on COMPANY resolution.
  const user = await tenantPrisma.user.findFirst({
    select: {
      isFirstLogin: true,
    },
  });

  return {
    isFirstLogin: user?.isFirstLogin ?? true,
    onboardingStatus: company.onboardingStatus,
    status: company.status,
  };
}

/**
 * Load all prefilled data for setup wizard
 */

export async function getOnboardingData(companyId: string) {
  // STRICT: Use findUnique
  const masterCompany = await prismaSuperUser.company.findUnique({
    where: { id: companyId }
  });

  if (!masterCompany) throw new Error("No active company found in Master DB");
  if (!process.env.POSTGRES_BASE_URL) throw new Error("POSTGRES_BASE_URL is not defined");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  const companyProfile = await tenantPrisma.companyProfile.findFirst();
  const admin = await tenantPrisma.user.findFirst({
    select: {
      id: true,
      fullName: true,
      email: true,
      mobile: true,
      username: true,
      status: true,
      isFirstLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });
  const settings = await tenantPrisma.companySettings.findFirst();
  const branches = await tenantPrisma.branch.findMany(); 

  // --- TRANSITIONAL READ STRATEGY (Step 3) ---
  // Priority: 1. Structured Columns (CompanyProfile) -> 2. Legacy JSON (settings.additionalInfo)

  const legacyAdditional = (settings?.settingsJson as any)?.additionalInfo || {};

  // Construct "Virtual" Settings Object for Frontend Compatibility
  // The frontend expects `settings.settingsJson.additionalInfo` to be populated.
  // We reconstruct it here merging source of truth.

  const mergedAdditionalInfo = {
    legalName: companyProfile?.legalName || legacyAdditional.legalName || "",
    displayName: companyProfile?.displayName || legacyAdditional.displayName || "",
    websiteUrl: companyProfile?.websiteUrl || legacyAdditional.websiteUrl || "",
    companyType: companyProfile?.companyType || legacyAdditional.companyType || "",
    incorporationDate: companyProfile?.incorporationDate || legacyAdditional.incorporationDate || "",
    supportEmail: companyProfile?.supportEmail || legacyAdditional.supportEmail || "",
    supportPhone: companyProfile?.supportPhone || legacyAdditional.supportPhone || "",
    description: companyProfile?.description || legacyAdditional.description || "",
  };

  // Re-inject into settings structure so Frontend doesnt break
  const augmentedSettings = settings ? {
    ...settings,
    settingsJson: {
      ...((settings.settingsJson as any) || {}),
      additionalInfo: mergedAdditionalInfo
    }
  } : null;


  return {
    companyProfile,
    admin,
    settings: augmentedSettings, // Return patched settings
    branches, 
    onboardingStatus: masterCompany.onboardingStatus,
  }

}

import { 
  validateLegalInfo, 
  validateSetupDates 
} from "../validators/onboarding.validator";
import { validateIndianLocation } from "../validators/location.validator";

/**
 * Step 1 — Company basic info
 */
export async function updateCompanyInfo(companyId: string, data: any) {
  const masterCompany = await prismaSuperUser.company.findUnique({
    where: { id: companyId }
  });

  if (!masterCompany) throw new Error("No active company found in Master DB");
  
  // --- BACKEND VALIDATION ---
  // --- BACKEND VALIDATION ---
  validateIndianLocation(data.country, data.state, data.district, data.city);

  if (!process.env.POSTGRES_BASE_URL) throw new Error("POSTGRES_BASE_URL is not defined");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  await tenantPrisma.companyProfile.update({
    where: { id: data.id },
    data: {
      companyName: data.companyName,
      email: data.email,
      mobile: data.mobile,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      district: data.district,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
    },
  });
}

/**
 * Step 2 — Root admin info
 */

export async function updateAdminInfo(companyId: string, data: any) {
  const masterCompany = await prismaSuperUser.company.findUnique({
    where: { id: companyId }
  });

  if (!masterCompany) throw new Error("No active company found in Master DB");
  if (!process.env.POSTGRES_BASE_URL) throw new Error("POSTGRES_BASE_URL is not defined");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  await tenantPrisma.user.update({
    where: { id: data.id },
    data: {
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
    },
  });
}
/**
 * Step 5 — Financial / system settings
 */
/**
 * Step Generic — Persist wizard data to settingsJson
 * Payload expected: { stepKey: string, data: any }
 */
export async function updateSettings(companyId: string, payload: any) {
  const masterCompany = await prismaSuperUser.company.findUnique({
    where: { id: companyId }
  });

  if (!masterCompany) throw new Error("No active company found in Master DB");
  if (!process.env.POSTGRES_BASE_URL) throw new Error("POSTGRES_BASE_URL is not defined");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  const { stepKey, data } = payload;
  if (!stepKey || !data) {
    throw new Error("Invalid payload: stepKey and data are required");
  }

  // --- SAFETY GUARD 1: Prevent Domain Pollution ---
  const FORBIDDEN_STEP_KEYS = ['branchInfo', 'legalInfo', 'accounting', 'branch', 'legal', 'financial'];
  if (FORBIDDEN_STEP_KEYS.includes(stepKey)) {
    throw new Error(`Invalid stepKey '${stepKey}'. usage of updateSettings for this domain is RESTRICTED.`);
  }

  // 🟢 PHASE 2 — Enforce Sequential Dependency Model
  if (stepKey === 'additionalInfo') {
      await validateStepPrerequisite(tenantPrisma, 'additionalInfo');
  }

  // --- SPECIAL HANDLING: Additional Info (Step 4 Fix) ---
  if (stepKey === 'additionalInfo') {
     // 1. Get Profile
     const profile = await tenantPrisma.companyProfile.findFirst();
     if (!profile) throw new Error("Company Profile not found");

     // --- BACKEND VALIDATION ---
     validateSetupDates({ incorporationDate: data.incorporationDate });

     // 2. Update Profile Columns
     await tenantPrisma.companyProfile.update({
        where: { id: profile.id },
        data: {
            legalName: data.legalName,
            displayName: data.displayName,
            websiteUrl: data.websiteUrl,
            companyType: data.companyType,
            incorporationDate: data.incorporationDate,
            supportEmail: data.supportEmail,
            supportPhone: data.supportPhone,
            description: data.description,
        }
     });

     // 3. Update completedSteps in database
     const currentSettings = await tenantPrisma.companySettings.findFirst();
     const currentJson = (currentSettings?.settingsJson as any) || {};
     const updatedJson = {
         ...currentJson,
         completedSteps: {
             ...(currentJson.completedSteps || {}),
             additionalInfo: true
         }
     };

     if (currentSettings) {
         await tenantPrisma.companySettings.update({
             where: { id: currentSettings.id },
             data: { settingsJson: updatedJson }
         });
     }

     return {
         ...updatedJson,
         additionalInfo: data // Return what was just saved so UI updates
     };
  }

  // --- SAFETY GUARD 2: Strict Whitelist (JSON Guard) ---
  // Only allow specific UI/Display fields for 'details' or misc
  const ALLOWED_DATA_KEYS = [
    "logoPreview", 
    "completed" 
  ];

  const payloadKeys = Object.keys(data);
  for (const key of payloadKeys) {
    if (!ALLOWED_DATA_KEYS.includes(key)) {
      throw new Error(`Invalid Key in settings payload: '${key}'. Allowed: ${ALLOWED_DATA_KEYS.join(", ")}`);
    }
  }

  // 1. Get existing settings
  const existingSettings = await tenantPrisma.companySettings.findFirst();
  if (!existingSettings) {
    throw new Error("Company settings not found");
  }

  // 2. Prepare new JSON state
  const currentJson = (existingSettings.settingsJson as any) || {};

  // 3. Merge Strategy:
  // - Update the specific step data
  // - Update the completedSteps status
  const updatedJson = {
    ...currentJson,
    [stepKey]: data,
    completedSteps: {
      ...(currentJson.completedSteps || {}),
      [stepKey]: true
    }
  };

  // 4. Save
  await tenantPrisma.companySettings.update({
    where: { id: existingSettings.id },
    data: {
      settingsJson: updatedJson,
    },
  });

  return updatedJson;
}

/**
 * Step 2: Branch Info -> Branch Table
 */
export async function updateBranchInfo(companyId: string, data: any) {
  // --- BACKEND VALIDATION ---
  validateIndianLocation(data.country, data.state, data.district, data.city); 



  const masterCompany = await prismaSuperUser.company.findUnique({ where: { id: companyId } });
  if (!masterCompany) throw new Error("No active company found");
  if (!process.env.POSTGRES_BASE_URL) throw new Error("POSTGRES_BASE_URL is not defined");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  // 🟢 PHASE 2 — Enforce Sequential Dependency Model
  await validateStepPrerequisite(tenantPrisma, 'branch');

  // Upsert Head Office Branch
  // POLICY: "Setup may create exactly one head office".
  // Implementation: We check for existing. If exists -> Update. If not -> Create.
  // This satisfies the uniqueness requirement while preventing "Double Creation" errors.
  const existingBranch = await tenantPrisma.branch.findFirst({ where: { isHeadOffice: true } });

  if (existingBranch) {
    await tenantPrisma.branch.update({
      where: { id: existingBranch.id },
      data: {
        name: data.branchName, // Mapped from UI
        email: data.branchEmail,
        mobile: data.branchMobile,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        district: data.district,
        city: data.city,
        state: data.state,
        postalCode: data.pincode || data.zipCode,
        country: data.country,
        workingDays: data.workingDays,
        workingHours: data.workingHours,
        stockEnabled: data.stockAllowed,
        approvalFlow: data.approvalFlow,
        // transactionLockDate: data.transactionLockDate
      }
    });
  } else {
    await tenantPrisma.branch.create({
      data: {
        isHeadOffice: true,
        name: data.branchName,
        email: data.branchEmail,
        mobile: data.branchMobile,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        district: data.district,
        city: data.city,
        state: data.state,
        postalCode: data.pincode || data.zipCode,
        country: data.country,
        workingDays: data.workingDays,
        workingHours: data.workingHours,
        stockEnabled: data.stockAllowed,
        approvalFlow: data.approvalFlow
      }
    });
  }
}

/**
 * Step 3: Legal Info -> ComplianceDetails Table
 */
export async function updateLegalInfo(companyId: string, data: any) {
  const masterCompany = await prismaSuperUser.company.findUnique({ where: { id: companyId } });
  if (!masterCompany) throw new Error("No active company found");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  // 🟢 PHASE 2 — Enforce Sequential Dependency Model
  await validateStepPrerequisite(tenantPrisma, 'legal');

  const profile = await tenantPrisma.companyProfile.findFirst();
  if (!profile) throw new Error("Company Profile not found");

  // --- BACKEND VALIDATION ---
  validateLegalInfo({
      gstin: data.gstin,
      pan: data.pan,
      state: profile.state,
      country: profile.country
  });

  const existing = await tenantPrisma.complianceDetails.findFirst();

  const payload = {
    gstin: data.gstin,
    pan: data.pan,
    tan: data.tan,
    cin: data.cin,
    msme: data.msme,
    lut: data.lut, // New field
    gstType: data.gstRegistrationType,
    gstState: data.gstStateCode,
    sezUnit: data.sezUnit,
  };

  if (existing) {
    await tenantPrisma.complianceDetails.update({
      where: { id: existing.id },
      data: payload
    });
  } else {
    await tenantPrisma.complianceDetails.create({
      data: payload
    });
  }

  // --- PERSIST COMPLETION STATUS ---
  const settings = await tenantPrisma.companySettings.findFirst();
  if (settings) {
    const currentJson = (settings.settingsJson as any) || {};
    await tenantPrisma.companySettings.update({
        where: { id: settings.id },
        data: {
            settingsJson: {
                ...currentJson,
                completedSteps: {
                    ...(currentJson.completedSteps || {}),
                    legalInfo: true
                }
            }
        }
    });
  }
}

/**
 * Step 4: Accounting -> FinancialPeriod Table
 */
export async function updateAccountingInfo(companyId: string, data: any) {
  const masterCompany = await prismaSuperUser.company.findUnique({ where: { id: companyId } });
  if (!masterCompany) throw new Error("No active company found");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  // 🟢 PHASE 2 — Enforce Sequential Dependency Model
  await validateStepPrerequisite(tenantPrisma, 'accounting');

  // --- BACKEND VALIDATION ---
  validateSetupDates({
      financialYearStart: data.financialYearStart,
      financialYearEnd: data.financialYearEnd
  });

  const existing = await tenantPrisma.financialPeriod.findFirst();

  const payload = {
    baseCurrency: data.baseCurrency,
    financialYearFrom: new Date(data.financialYearStart),
    financialYearTo: new Date(data.financialYearStart), // Logic to verify?
    // For now putting same, assuming UI handles end date or backend logic needed? 
    // User prompt says "FinancialPeriod" already correct.
    // Let's assume start date + 1 year for now if end date missing?
    // Or receive from UI. UI sends 'financialYearEnd' but disabled/autofilled?
    // Let's check UI... UI sends it.
    // Fix: Use data.financialYearEnd if available, else derive.
    accountingMethod: data.accountingMethod,
    decimalPrecision: parseInt(data.decimalPrecision),
    invoiceStartNo: parseInt(data.invoiceStartNumber),
    invoicePrefix: data.invoicePrefix,
    openingBalanceDate: data.openingBalanceDate ? new Date(data.openingBalanceDate) : null,
    openingBalance: data.openingBalance,
    creditNotePrefix: data.creditNotePrefix,
    debitNotePrefix: data.debitNotePrefix,
    timezone: data.timezone,
    roundOff: data.roundOff
  };

  // Fix Dates
  if (data.financialYearEnd) {
    payload.financialYearTo = new Date(data.financialYearEnd);
  } else {
    // Default to +1 year - 1 day
    const end = new Date(payload.financialYearFrom);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    payload.financialYearTo = end;
  }

  if (existing) {
    await tenantPrisma.financialPeriod.update({
      where: { id: existing.id },
      data: payload
    });
  } else {
    await tenantPrisma.financialPeriod.create({
      data: payload
    });
  }

  // --- PERSIST COMPLETION STATUS ---
  const settings = await tenantPrisma.companySettings.findFirst();
  if (settings) {
    const currentJson = (settings.settingsJson as any) || {};
    await tenantPrisma.companySettings.update({
        where: { id: settings.id },
        data: {
            settingsJson: {
                ...currentJson,
                completedSteps: {
                    ...(currentJson.completedSteps || {}),
                    accounting: true
                }
            }
        }
    });
  }
}

/**
 * Status Check
 */
export async function getSetupStatus(companyId: string) {
  const masterCompany = await prismaSuperUser.company.findUnique({ where: { id: companyId } });
  if (!masterCompany) throw new Error("No active company found");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  // 🟢 PHASE 4 — Hardened State Retrieval
  const state = await getOnboardingState(tenantPrisma);

  return {
    general: state.generalInfoComplete,
    additional: state.generalInfoComplete, // Additional is part of General in this model
    legal: state.legalComplete,
    accounting: state.accountingComplete,
    branch: state.branchComplete,
    completed: masterCompany.onboardingStatus === 'completed'
  };
}

/**
 * Final step — Complete onboarding
 */
export async function completeOnboarding(companyId: string) {
  const masterCompany = await prismaSuperUser.company.findUnique({
    where: { id: companyId }
  });

  if (!masterCompany) throw new Error("No active company found in Master DB");
  if (!process.env.POSTGRES_BASE_URL) throw new Error("POSTGRES_BASE_URL is not defined");

  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${masterCompany.dbName}`;
  const tenantPrisma = getTenantPrisma(dbUrl);

  // 🟢 PHASE 4 — Harden /complete
  // 1. ALWAYS validate Tenant State first.
  // Master DB status is NOT the authority for correctness.
  const state = await getOnboardingState(tenantPrisma);

  if (
    !state.generalInfoComplete ||
    !state.legalComplete ||
    !state.accountingComplete ||
    !state.branchComplete
  ) {
    throw new Error("Setup incomplete or inconsistent."); 
  }

  // 2. Safe Replay Check
  // Only AFTER validation passes do we check if we already marked it done.
  if (masterCompany.onboardingStatus === "completed") {
    return {
      alreadyCompleted: true,
      message: "Onboarding is already completed."
    };
  }

  // 3. Mark user first-login as false (tenant DB)
  // NOTE: This assumes there is an ID we can target, or we update many?
  // Previous code didn't specify WHERE on User, it just did:
  // await prismaSuperUser.company.update(...) <-- Wait, previous code was WRONG?
  // Let's look at previous code:
  // await prismaSuperUser.company.update({ where: { id: masterCompany.id }, ... })
  // It was updating company twice?
  // Ah, line 185 in previous was updating COMPANY (prismaSuperUser).
  // But comment said "Mark user first-login".
  // Let's see...

  // FIX: We need to mark the TENANT user as not first login.
  // Since we don't have auth ID yet, we'll update ALL users (likely only 1 admin) 
  // or findFirst. 
  // Ideally, updateMany is safest for "all admins".
  await tenantPrisma.user.updateMany({
    data: { isFirstLogin: false }
  });


  // 2. Mark company onboarding completed (master DB)
  await prismaSuperUser.company.update({
    where: { id: masterCompany.id },
    data: { onboardingStatus: "completed" },
  });

  // 3. Mark setupCompleted in Tenant DB (for consistency)
  const existingSettings = await tenantPrisma.companySettings.findFirst();
  if (existingSettings) {
    const currentJson = (existingSettings.settingsJson as any) || {};
    await tenantPrisma.companySettings.update({
      where: { id: existingSettings.id },
      data: {
        settingsJson: {
          ...currentJson,
          setupCompleted: true
        }
      }
    });
  }
}
