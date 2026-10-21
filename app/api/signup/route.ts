import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { findUserByEmail } from '@/lib/db/users';
import bcrypt from 'bcryptjs';
import { isEmailAllowed } from '@/lib/allowed-emails';
import { firstIssue, signupSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const parsed = signupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
    }

    // email is already trimmed and lowercased by the schema
    const { name, email, password } = parsed.data;

    // Check if email is in the allowed list
    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        { error: 'This email is not authorized to sign up. Please contact the family admin.' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
