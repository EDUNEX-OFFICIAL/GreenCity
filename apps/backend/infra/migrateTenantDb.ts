import { execa } from "execa";

export async function migrateTenantDb(dbName: string) {
  if (!process.env.POSTGRES_BASE_URL) {
    throw new Error("POSTGRES_BASE_URL is not defined");
  }

  const tenantDbUrl = `${process.env.POSTGRES_BASE_URL}/${dbName}`;

  await execa(
    "npx",
    ["prisma", "migrate", "deploy", "--schema=prisma/tenant/schema.prisma"],
    {
      env: {
        ...process.env,
        DATABASE_URL: tenantDbUrl, // 🔥 THIS IS THE REAL FIX
      },
      stdio: "inherit",
    }
  );
}
