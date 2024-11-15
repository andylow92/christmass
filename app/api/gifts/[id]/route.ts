import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// app/api/gifts/[id]/route.ts
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const giftId = parseInt(params.id);
      const updates = await request.json();
  
      const updatedGift = await db
        .update(gifts)
        .set(updates)
        .where(eq(gifts.id, giftId))
        .returning();
  
      return NextResponse.json(updatedGift[0]);
    } catch (error) {
      console.error('Error updating gift:', error);
      return NextResponse.json(
        { error: 'Error updating gift' },
        { status: 500 }
      );
    }
  }

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const giftId = parseInt(params.id);

    await db
      .delete(gifts)
      .where(eq(gifts.id, giftId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting gift:', error);
    return NextResponse.json(
      { error: 'Error deleting gift' },
      { status: 500 }
    );
  }
}