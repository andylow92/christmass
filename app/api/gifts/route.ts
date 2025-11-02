
// app/api/gifts/route.ts
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return ALL gifts from all users so family members can see each other's wishlists
    const allGifts = await db.select().from(gifts);

    return NextResponse.json(allGifts);
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { item, description, priceRange } = await request.json();

    // Validate required fields
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Use authenticated user's ID
    const userId = parseInt(session.user.id);

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
