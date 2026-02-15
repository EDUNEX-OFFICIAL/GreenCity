export function generateSlug(value: string): string {
  if (!value || typeof value !== "string") {
    throw new Error("Invalid company name for slug generation");
  }

  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_") 
    .replace(/[^a-z0-9-]/g, "");
}
