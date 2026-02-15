// Internal Domain Model (Flat) - used by Service & Seed
export interface CompanyCreateModel {
  // Step 1: Company Info
  companyName: string;
  email: string;
  mobileNumber: string;
  country: string;
  state: string;
  district: string;
  postalCode: string;
  addressLine1?: string;
  addressLine2?: string;

  // Step 2: Root Admin Info
  adminName: string;
  adminEmail: string;
  adminMobile: string;
  username: string;
  password: string;

  // Step 3: Subscription & Config
  plan: "free" | "pro" | "enterprise";
  conversionId: string;
  dsaName?: string;
  upcomingBetaMode?: boolean;
}

// Nested Payload - matches Frontend & Controller & Service
export interface CreateCompanyInput {
  companyInfo: {
    companyName: string;
    email: string;
    mobileNumber: string;
    addressLine1?: string;
    addressLine2?: string;
    country: string;
    state: string;
    district: string;
    postalCode: string;
  };
  rootAdmin: {
    fullName: string;
    email: string;
    mobileNumber: string;
    username: string;
    password: string;
  };
  subscription: {
    plan: "free" | "pro" | "enterprise";
    conversionId: string;
    dsaName?: string;
    betaMode?: boolean;
  };
}
