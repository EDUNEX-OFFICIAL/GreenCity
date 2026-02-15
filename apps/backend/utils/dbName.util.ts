import { generateSlug } from "./slug.util";

export function generateDbName(companyName: string, companyId?: string): string {
  const safeSlug = generateSlug(companyName);

  const now = new Date();
  const ts =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  let dbName = `db_${safeSlug}_${ts}`;

  if (companyId) {
    const suffix = companyId.substring(0, 8);
    dbName = `${dbName}_${suffix}`;
  }

  return dbName;
}
