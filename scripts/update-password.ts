// Script to update Andres' password to 'andres123'
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Load environment variables FIRST
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Create database connection
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function updatePassword() {
  try {
    console.log('Starting password update...');

    // Hash the new password
    const newPassword = 'andres123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Password hashed successfully');

    // Update the password for user with name 'Andres' or email containing 'andres'
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.name, 'Andres'))
      .returning();

    if (result.length > 0) {
      console.log('Password updated successfully for user:', result[0].name);
      console.log('Email:', result[0].email);
    } else {
      // Try by email if name didn't match
      console.log('No user found with name "Andres", trying to find by email...');

      const allUsers = await db.select().from(users);
      console.log('All users:', allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));

      const andresUser = allUsers.find(u =>
        u.name?.toLowerCase().includes('andres') ||
        u.email?.toLowerCase().includes('andres')
      );

      if (andresUser) {
        const updateResult = await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, andresUser.id))
          .returning();

        console.log('Password updated successfully for user:', updateResult[0].name);
        console.log('Email:', updateResult[0].email);
      } else {
        console.log('No user found matching "andres"');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

updatePassword();
