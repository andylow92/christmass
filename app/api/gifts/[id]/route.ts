import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// app/api/gifts/[id]/route.ts
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const giftId = parseInt(params.id);
      const updates = await request.json();
      const userId = parseInt(session.user.id);

      // Check if the gift exists and get its owner
      const [existingGift] = await db
        .select()
        .from(gifts)
        .where(eq(gifts.id, giftId))
        .limit(1);

      if (!existingGift) {
        return NextResponse.json(
          { error: 'Gift not found' },
          { status: 404 }
        );
      }

      // If updating only status, anyone can do it (to mark "I'll buy this" or "Bought")
      const isStatusOnlyUpdate = Object.keys(updates).length === 1 && 'status' in updates;

      // If updating gift details (item, description, priceRange), only owner can do it
      if (!isStatusOnlyUpdate && existingGift.userId !== userId) {
        return NextResponse.json(
          { error: 'Only the gift owner can edit gift details' },
          { status: 403 }
        );
      }

      // Perform the update
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const giftId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Only allow deleting gifts that belong to the authenticated user
    const deletedGift = await db
      .delete(gifts)
      .where(and(eq(gifts.id, giftId), eq(gifts.userId, userId)))
      .returning();

    if (deletedGift.length === 0) {
      return NextResponse.json(
        { error: 'Gift not found or unauthorized' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting gift:', error);
    return NextResponse.json(
      { error: 'Error deleting gift' },
      { status: 500 }
    );
  }
}