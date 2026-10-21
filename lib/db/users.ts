// lib/db/users.ts
import { sql } from 'drizzle-orm';
import { db } from '.';
import { users } from './schema';
import { normalizeEmail } from '../validation';

// Case-insensitive so rows saved before emails were normalized still match
export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizeEmail(email)}`)
    .limit(1);

  return user;
}
