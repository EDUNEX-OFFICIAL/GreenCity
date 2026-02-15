import { 
  validateLocation, 
  validateGst, 
  getStatesByCountry 
} from "../../../../shared/location/index";

/**
 * Validates the core compliance logic for a company
 */
export function validateLegalInfo(data: {
  gstin?: string;
  pan?: string;
  state: string;
  country: string;
}) {
  if (data.gstin) {
    const result = validateGst(data.gstin, data.country, data.state);
    if (!result.valid) {
      throw new Error(result.error || "Invalid GSTIN format");
    }
  }

  if (data.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)) {
    throw new Error("Invalid PAN format");
  }
}

/**
 * Validates hierarchy of location
 */
export function validateLocationHierarchy(country: string, state: string, district?: string) {
  const result = validateLocation(country, state, district || null);
  if (!result.valid) {
    throw new Error(result.error || `Invalid location hierarchy: ${country} -> ${state} ${district ? `-> ${district}` : ""}`);
  }
}

/**
 * Validates dates in setup
 */
export function validateSetupDates(data: {
  incorporationDate?: string;
  financialYearStart?: string;
  financialYearEnd?: string;
}) {
  const now = new Date();
  
  if (data.incorporationDate) {
    const incDate = new Date(data.incorporationDate);
    if (incDate > now) {
      throw new Error("Incorporation Date cannot be in the future");
    }
  }

  if (data.financialYearStart && data.financialYearEnd) {
      const start = new Date(data.financialYearStart);
      const end = new Date(data.financialYearEnd);
      if (end <= start) {
          throw new Error("Financial Year End must be after Start Date");
      }
  }
}
