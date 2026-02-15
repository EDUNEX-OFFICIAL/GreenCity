import { PrismaClient as PrismaClientSuperUser } from '@prisma/superuser-client';
import { PrismaClient as PrismaClientTenant } from "./generated/tenant-client";

export const prismaSuperUser = new PrismaClientSuperUser();
export function getTenantPrisma(dbUrl: string) {
  return new PrismaClientTenant({
    datasources: {
      db: { url: dbUrl },
    },
  });
}

