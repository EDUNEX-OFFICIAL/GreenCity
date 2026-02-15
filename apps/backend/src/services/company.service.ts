import { prismaSuperUser } from "../db/superuser";
import { generateSlug } from "../../utils/slug.util";
import { generateDbName } from "../../utils/dbName.util";
import { createTenantDb } from "../../infra/createTenantDb";
import { migrateTenantDb } from "../../infra/migrateTenantDb";
import { seedTenantDb } from "../../infra/seedTenantDb";
import { CreateCompanyInput } from "../../types/company";
import { Client } from "pg";
import bcrypt from "bcrypt";

/**
 * Custom error to explicitly signal
 * that a company already exists in master DB.
 * This allows clean HTTP 409 handling.
 */
class CompanyAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Company with name "${name}" already exists`);
    this.name = "CompanyAlreadyExistsError";
  }
}

/**
 * Drop tenant database.
 * Used ONLY during rollback when onboarding fails mid-way.
 */
export async function dropTenantDb(dbName: string) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_SUPERUSERS,
  });

  await client.connect();

  // 1️⃣ Terminate all connections to the tenant DB
  await client.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1
      AND pid <> pg_backend_pid();
    `,
    [dbName]
  );

  // 2️⃣ Now safely drop the DB
  await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);

  await client.end();
}


/**
 * Service: Create Company (Core Infrastructure Flow)
 *
 * Responsibilities:
 * - Enforce uniqueness of company
 * - Create master DB record
 * - Create tenant DB
 * - Apply tenant schema
 * - Seed tenant DB
 * - Rollback safely on failure
 *
 * NOTE:
 * - This function is intentionally auth-agnostic
 * - This is core SaaS infrastructure
 */
export async function createCompanyService(input: CreateCompanyInput) {
  const { companyInfo, rootAdmin, subscription } = input;

  // URL-safe slug (used for routing / display)
  const slug = generateSlug(companyInfo.companyName);

  /**
   * FAIL-FAST CHECK
   * One company name = one company
   * We do NOT allow duplicates at any cost
   */
  const existing = await prismaSuperUser.company.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new CompanyAlreadyExistsError(companyInfo.companyName);
  }

  // DB-safe name (underscores only, no hyphens)
  // Step 1: Generate temporary name (timestamp only) for initial creation
  let dbName = generateDbName(companyInfo.companyName);

  let companyId: string | null = null;
  let tenantDbCreated = false;

  try {
    /**
     * STEP 1: Create company entry in master DB
     * This is the source of truth for tenant mapping
     */
    const company = await prismaSuperUser.company.create({
      data: {
        name: companyInfo.companyName,
        slug,
        dbName, // Temporary name
        status: "active",
        plan: subscription.plan,

        onboardingStatus: "pending" // 👈 EXPLICIT
      }
    });


    companyId = company.id;

    // Step 2: Generate Final Deterministic Name (using ID)
    const finalDbName = generateDbName(companyInfo.companyName, companyId!);

    // Step 3: Update Master Record with Final Name
    await prismaSuperUser.company.update({
      where: { id: companyId },
      data: { dbName: finalDbName }
    });

    // Update local variable for downstream use (Provisioning & Rollback)
    dbName = finalDbName;

    /**
     * STEP 2: Create tenant database
     * Physical PostgreSQL DB creation
     */
    await createTenantDb(dbName);
    tenantDbCreated = true;

    /**
     * STEP 3: Apply tenant schema
     * Uses prisma migrate deploy (runtime-safe)
     */
    await migrateTenantDb(dbName);

    /**
     * STEP 4: Seed tenant database
     * - company profile
     * - owner user
     * - system permissions
     * - company settings
     */
    const hashedPassword = await bcrypt.hash(rootAdmin.password, 10);

    // Create a safe input object with hashed password
    const seedInput: CreateCompanyInput = {
      ...input,
      rootAdmin: {
        ...rootAdmin,
        password: hashedPassword
      }
    };

    await seedTenantDb(dbName, seedInput);

    // All steps succeeded
    return {
      companyId: company.id,
      dbName,
      message: "Company created successfully",
    };
  } catch (error) {
    /**
     * ROLLBACK STRATEGY
     */

    if (tenantDbCreated) {
      await dropTenantDb(dbName);
    }

    if (companyId) {
      await prismaSuperUser.company.delete({
        where: { id: companyId },
      });
    }

    // Bubble error to controller
    console.error(`[Provisioning Failed] DB: ${dbName} | Error: ${error}`);
    throw error;
  }
}

/**
 * Service: List All Companies
 * 
 * Fetches all registered companies from the Master Database.
 * This does NOT connect to individual tenant databases.
 */
export async function getAllCompanies() {
  const companies = await prismaSuperUser.company.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
  return companies;
}
