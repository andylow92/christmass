// lib/db/index.ts
// lib/db/index.ts
import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure neon if needed (optional)
neonConfig.fetchConnectionCache = true;

// Explicitly type the sql function
const sql = neon(process.env.DATABASE_URL) as NeonQueryFunction<boolean, boolean>;

// Create the database instance
export const db = drizzle(sql);

// Export sql if needed elsewhere
export { sql };