// app/api/gifts/route.ts
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { firstIssue, giftDetailsSchema } from '@/lib/validation';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Return ALL gifts from all users so family members can see each other's wishlists
    const allGifts = await db.select().from(gifts);

    // Keep the surprise: owners never see whether their own gifts are claimed
    const visibleGifts = allGifts.map((gift) =>
      gift.userId === userId ? { ...gift, status: null } : gift
    );

    return NextResponse.json(visibleGifts);
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

    const parsed = giftDetailsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
    }

    // Use authenticated user's ID
    const userId = parseInt(session.user.id);

    const [newGift] = await db
      .insert(gifts)
      .values({ userId, ...parsed.data })
      .returning();

    return NextResponse.json({ ...newGift, status: null });
  } catch (error) {
    console.error('Error creating gift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
