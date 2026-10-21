// app/api/gifts/[id]/route.ts
import { db } from '@/lib/db';
import { gifts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  firstIssue,
  giftDetailsSchema,
  giftStatusUpdateSchema,
} from '@/lib/validation';

function parseGiftId(id: string): number | null {
  const giftId = Number(id);
  return Number.isInteger(giftId) && giftId > 0 ? giftId : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const giftId = parseGiftId(params.id);
    if (giftId === null) {
      return NextResponse.json({ error: 'Invalid gift id' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const userId = parseInt(session.user.id);

    // A request either changes the status or the details, never both
    const isStatusUpdate =
      typeof body === 'object' && body !== null && 'status' in body;
    const parsed = isStatusUpdate
      ? giftStatusUpdateSchema.safeParse(body)
      : giftDetailsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
    }

    // Check if the gift exists and get its owner
    const [existingGift] = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, giftId))
      .limit(1);

    if (!existingGift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const isOwner = existingGift.userId === userId;

    // Owners edit their details; everyone else marks "I'll get it" / "Bought"
    if (isStatusUpdate && isOwner) {
      return NextResponse.json(
        { error: 'You cannot change the status of your own gift' },
        { status: 403 }
      );
    }
    if (!isStatusUpdate && !isOwner) {
      return NextResponse.json(
        { error: 'Only the gift owner can edit gift details' },
        { status: 403 }
      );
    }

    const [updatedGift] = await db
      .update(gifts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(gifts.id, giftId))
      .returning();

    return NextResponse.json(
      isOwner ? { ...updatedGift, status: null } : updatedGift
    );
  } catch (error) {
    console.error('Error updating gift:', error);
    return NextResponse.json({ error: 'Error updating gift' }, { status: 500 });
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

    const giftId = parseGiftId(params.id);
    if (giftId === null) {
      return NextResponse.json({ error: 'Invalid gift id' }, { status: 400 });
    }

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
    return NextResponse.json({ error: 'Error deleting gift' }, { status: 500 });
  }
}
