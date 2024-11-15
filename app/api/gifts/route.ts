
// app/api/gifts/route.ts
// app/api/gifts/route.ts
import { db } from '@/lib/db';
import { gifts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allGifts = await db.select().from(gifts);
    return NextResponse.json(allGifts);
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, item, description, priceRange } = await request.json();

    // Validate required fields
    if (!userId || !item || typeof item !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Ensure user exists
    const userExists = await db.select().from(users).where(eq(users.id, userId));
    if (userExists.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // Insert new gift
    const newGift = await db
      .insert(gifts)
      .values({ userId, item, description, priceRange })
      .returning();
    return NextResponse.json(newGift[0]);
  } catch (error) {
    console.error('Error creating gift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
