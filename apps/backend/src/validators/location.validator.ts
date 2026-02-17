import { INDIA_LOCATION } from "@shared/india";

export function validateIndianLocation(
  country: string,
  state: string,
  district: string,
  city: string
) {
  // Trim inputs
  const countryTrim = country?.trim();
  const stateTrim = state?.trim();
  const districtTrim = district?.trim();
  const cityTrim = city?.trim();

  if (!countryTrim || !stateTrim || !districtTrim || !cityTrim) {
      throw new Error("Location fields (Country, State, District, City) are required.");
  }

  // Validate Country (India only)
  if (countryTrim !== "India" && countryTrim !== "IN") {
     throw new Error("Invalid country. Only India is supported.");
  }

  // Validate State
  const stateData = INDIA_LOCATION[stateTrim];
  if (!stateData) {
    throw new Error(`Invalid state: ${stateTrim}`);
  }

  // Validate District
  const districts = stateData.districts;
  if (!districts[districtTrim]) {
      throw new Error(`District '${districtTrim}' does not belong to state '${stateTrim}'.`);
  }

  // Validate City
  const cities = districts[districtTrim];
  // cities is string[]
  if (!cities.includes(cityTrim)) {
      throw new Error(`City '${cityTrim}' does not belong to district '${districtTrim}'.`);
  }
}
