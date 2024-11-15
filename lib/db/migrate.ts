// lib/db/migrate.ts
// lib/db/migrate.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  // Add explicit typing for the sql client
  const sql = neon(process.env.DATABASE_URL) as NeonQueryFunction<boolean, boolean>;
  const db = drizzle(sql);

  console.log('⏳ Running migrations...');
  
  const start = Date.now();
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed');
    console.error(error);
    process.exit(1);
  }
};

// Improved error handling
runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});