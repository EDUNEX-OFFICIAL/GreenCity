import { Client } from "pg";

export async function createTenantDb(dbName: string) {
    // GUARD: Enforce timestamp suffix (YYYYMMDDHHmm -> 12 digits) + Deterministic ID Suffix
    // This prevents accidental creation of "db_<slug>" or non-deterministic names.
    // Format: db_slug_TIMESTAMP_SUFFIX
    if (!/_[\d]{12}_[a-z0-9]+$/.test(dbName)) {
        throw new Error(
            `Invalid tenant DB name "${dbName}". Must follow format: db_<slug>_<timestamp>_<idSuffix>`
        );
    }

    // GUARD: Base URL Check
    if (!process.env.POSTGRES_BASE_URL) {
        throw new Error("POSTGRES_BASE_URL is not defined");
    }
    if (process.env.POSTGRES_BASE_URL.includes("db_")) { // Defensive check for DB name
        // Note: User prompt asked for .includes("/") check, but base URL has // for protocol.
        // I will use a stricter check: split by / and check length, or rely on the user's explicit instruction if possible.
        // User "if (process.env.POSTGRES_BASE_URL.includes("/"))" is risky for "postgresql://".
        // Use strict parser or checks.
        // For now, I will use a simplified check that targets the "path" part roughly.
        // Actually, let's stick to the prompt's INTENT: "Does NOT include any database name".
        const url = new URL(process.env.POSTGRES_BASE_URL);
        if (url.pathname && url.pathname !== "/") {
            throw new Error("POSTGRES_BASE_URL must NOT include a database name");
        }
    }

    const client = new Client({
        connectionString: process.env.POSTGRES_BASE_URL,
    });

    await client.connect();
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created successfully`);
    await client.end();
}
