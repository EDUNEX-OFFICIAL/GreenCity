import { PrismaClient } from "../src/generated/superuser-client";
import { spawn } from "child_process";
import * as dotenv from "dotenv";

dotenv.config();

// Helper Function (Inlined & native child_process)
async function migrateTenantDb(dbName: string) {
  if (!process.env.POSTGRES_BASE_URL) {
    throw new Error("POSTGRES_BASE_URL is not defined");
  }

  const tenantDbUrl = `${process.env.POSTGRES_BASE_URL}/${dbName}`;

  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      "npx.cmd", // Windows compatibility (use npx on linux/mac, npx.cmd on windows usually, but cross-spawn is better. We'll try npx first, if fails try npx.cmd or just 'prisma')
      ["prisma", "migrate", "deploy", "--schema=prisma/tenant/schema.prisma"],
      {
        env: {
          ...process.env,
          DATABASE_URL: tenantDbUrl,
        },
        stdio: "inherit",
        shell: true // Safe for local scripts, handles command resolution better
      }
    );

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Migration failed with exit code ${code}`));
      }
    });

    child.on("error", (err) => {
        reject(err);
    });
  });
}

const prismaSuperUser = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_SUPERUSERS,
    },
  },
});

async function main() {
  console.log("🚀 Starting Tenant Migration Deployment...");

  // 1. Fetch Active Tenants
  const tenants = await prismaSuperUser.company.findMany({
    where: {
      status: { not: "deleted" }, // Safety: Only ACTIVE/SUSPENDED tenants
    },
  });

  console.log(`📋 Found ${tenants.length} tenants to migrate.`);

  // 2. Iterate and Migrate
  for (const tenant of tenants) {
    console.log(`\n🔹 Migrating Tenant: ${tenant.name} (${tenant.dbName})...`);
    try {
      await migrateTenantDb(tenant.dbName);
      console.log(`✅ Success: ${tenant.dbName}`);
    } catch (error) {
      console.error(`❌ FAILED: ${tenant.dbName}`);
      console.error(error);
      // Decide: Stop on error or continue?
      // User said "If any fails -> stop and alert"
      process.exit(1);
    }
  }

  console.log("\n🎉 All tenant migrations completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaSuperUser.$disconnect();
  });
