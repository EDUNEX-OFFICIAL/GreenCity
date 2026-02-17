export const INDIA_LOCATION: Record<string, { code: string; districts: Record<string, string[]> }> = {
  Bihar: {
    code: "10",
    districts: {
      Patna: ["Patna City", "Danapur"],
      Gaya: ["Gaya City", "Sherghati"],
    },
  },
  Telangana: {
    code: "36",
    districts: {
      Hyderabad: ["Secunderabad", "Charminar"],
      Rangareddy: ["Shamshabad", "Chevella"],
    },
  },
};
