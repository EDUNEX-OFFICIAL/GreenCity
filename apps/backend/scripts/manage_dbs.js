const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration
// We connect to 'postgres' (the default maintenance DB) to perform Drop/Create operations
const PG_USER = process.env.POSTGRES_USER || 'postgres';
const PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'Pass@postgresql123'; // Fallback or read from env
const PG_HOST = 'localhost';
const PG_PORT = 5432;

// The connection string for the maintenance operations
const connectionString = `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/postgres`;

const client = new Client({
  connectionString: connectionString
});

async function run() {
  try {
    console.log('Connecting to PostgreSQL maintenance database...');
    await client.connect();
    console.log('Connected.');

    // List of databases to drop and create
    // These names should match what is expected by your application
    const dbs = ['db_greencity', 'db_master'];

    // Also include old names if you want to ensure cleanup of legacy DBs
    const legacyDbs = ['greenCity', 'superUsers']; 
    const allDbsToDrop = [...dbs, ...legacyDbs];

    // 1. Terminate connections and Drop Databases
    for (const db of allDbsToDrop) {
      try {
        console.log(`Checking database: ${db}`);
        
        // Terminate all connections to the database to allow dropping it
        await client.query(`
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE datname = '${db}' AND pid <> pg_backend_pid();
        `);
        
        console.log(`Dropping database "${db}" if it exists...`);
        await client.query(`DROP DATABASE IF EXISTS "${db}";`);
        console.log(`✓ Dropped (or didn't exist) "${db}"`);
      } catch (err) {
        console.error(`X Error processing "${db}":`, err.message);
      }
    }

    // 2. Create Databases
    for (const db of dbs) {
       try {
         console.log(`Creating database "${db}"...`);
         await client.query(`CREATE DATABASE "${db}";`);
         console.log(`✓ Created "${db}"`);
       } catch (err) {
         console.error(`X Error creating "${db}":`, err.message);
       }
    }
    
    console.log('\nAll database operations completed.');
  } catch (e) {
    console.error('Fatal Error:', e);
  } finally {
    await client.end();
  }
}

// Check for args to see if we should run
if (require.main === module) {
  run();
}

module.exports = run;
