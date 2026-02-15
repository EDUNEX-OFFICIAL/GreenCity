import { PrismaClient as PrismaClientTenant } from "../generated/tenant-client";

export function getTenantPrisma(dbUrl?: string) {
  if (!dbUrl) {
    return new PrismaClientTenant();
  }
  return new PrismaClientTenant({
    datasources: {
      db: { url: dbUrl },
    },
  });
}
