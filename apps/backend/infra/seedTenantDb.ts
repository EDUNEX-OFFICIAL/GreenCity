import { getTenantPrisma } from "../src/db/tenant";
import { CreateCompanyInput } from "../types/company";

const SYSTEM_PERMISSIONS = [
  { key: "user.create", label: "Create User" },
  { key: "user.update", label: "Update User" },
  { key: "user.delete", label: "Delete User" },
  { key: "settings.update", label: "Update Settings" },
];

export async function seedTenantDb(dbName: string, input: CreateCompanyInput) {
  if (!process.env.POSTGRES_BASE_URL) {
    throw new Error("POSTGRES_BASE_URL is not defined");
  }

  // Safe URL construction (using BASE_URL)
  const dbUrl = `${process.env.POSTGRES_BASE_URL}/${dbName}`;

  // ASSERTION: URL must be dynamic and distinct
  if (!dbUrl.endsWith(`/${dbName}`)) {
    throw new Error("Tenant DB URL construction failed: mismatch detected.");
  }

  const prisma = getTenantPrisma(dbUrl);

  try {
    const { companyInfo, rootAdmin, subscription } = input;

    // 1. Company profile
    await prisma.companyProfile.create({
      data: {
        companyName: companyInfo.companyName,
        email: companyInfo.email,
        mobile: companyInfo.mobileNumber,

        // Address
        addressLine1: companyInfo.addressLine1 || null,
        addressLine2: companyInfo.addressLine2 || null,
        city: companyInfo.district, // Mapping "district" to "city" based on previous logic
        state: companyInfo.state,
        country: companyInfo.country,
        postalCode: companyInfo.postalCode,

        // Subscription
        plan: subscription.plan,
        conversionId: subscription.conversionId,
        dsaName: subscription.dsaName || null,
      },
    });

    // 2. Owner user
    await prisma.user.create({
      data: {
        fullName: rootAdmin.fullName,
        email: rootAdmin.email,
        mobile: rootAdmin.mobileNumber,
        username: rootAdmin.username,
        passwordHash: rootAdmin.password, // ALREADY HASHED IN SERVICE
        status: "active",
        isFirstLogin: true, // 👈 EXPLICIT
      },
    });

    // 3. Permissions
    await prisma.permission.createMany({
      data: SYSTEM_PERMISSIONS,
    });

    // 4. Company settings
    await prisma.companySettings.create({
      data: {
        betaMode: subscription.betaMode ?? false,
        setupCompleted: false, // 👈 EXPLICIT
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
