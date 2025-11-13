import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { isAdmin } from '@/lib/admin';

// POST /api/admin/pending-prompts/[id]/reject
// Reject a pending prompt
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = await createClerkSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

    // Update moderation status to rejected
    const { data, error } = await supabase
      .from('community_prompts')
      .update({
        moderation_status: 'rejected',
        moderation_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting prompt:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt rejected successfully',
      prompt: data,
    });
  } catch (error) {
    console.error('[Reject Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reject prompt' },
      { status: 500 }
    );
  }
}
