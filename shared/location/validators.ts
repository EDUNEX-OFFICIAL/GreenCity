import { COUNTRIES } from "./india";

export function getStatesByCountry(countryName: string) {
  const country = COUNTRIES.find(c => c.name === countryName);
  return country ? country.states : [];
}

export function getDistrictsByState(countryName: string, stateName: string) {
  const country = COUNTRIES.find(c => c.name === countryName);
  if (!country) return [];
  const state = country.states.find(s => s.name === stateName);
  return state ? state.districts : [];
}

export function getGstCodeByState(countryName: string, stateName: string) {
  const country = COUNTRIES.find(c => c.name === countryName);
  if (!country) return null;
  const state = country.states.find(s => s.name === stateName);
  return state ? state.gstCode : null;
}

/**
 * Validates if the given combination of country, state, and district is valid.
 */
export function validateLocation(countryName: string, stateName: string | null, districtName: string | null) {
  const country = COUNTRIES.find(c => c.name === countryName);
  if (!country) return { valid: false, error: "Invalid Country" };

  if (stateName) {
    const state = country.states.find(s => s.name === stateName);
    if (!state) return { valid: false, error: `Invalid State '${stateName}' for country '${countryName}'` };

    if (districtName) {
      if (!state.districts.includes(districtName)) {
        return { valid: false, error: `Invalid District '${districtName}' for state '${stateName}'` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates if a GSTIN matches the expected state code.
 */
export function validateGst(gstin: string, countryName: string, stateName: string) {
  if (!gstin) return { valid: true }; // Optional check elsewhere

  const expectedCode = getGstCodeByState(countryName, stateName);
  if (!expectedCode) return { valid: false, error: "Could not determine GST State Code for validation" };

  if (!gstin.startsWith(expectedCode)) {
    return { 
      valid: false, 
      error: `GSTIN mismatch. For state '${stateName}', GSTIN must start with '${expectedCode}'.` 
    };
  }

  return { valid: true };
}
