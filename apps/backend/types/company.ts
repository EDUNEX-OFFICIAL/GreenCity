

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
    city: string;
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
