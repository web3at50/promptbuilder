import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { isAdmin } from '@/lib/admin';

// POST /api/admin/pending-prompts/[id]/approve
// Approve a pending prompt
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

    // Update moderation status to approved
    const { data, error } = await supabase
      .from('community_prompts')
      .update({
        moderation_status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error approving prompt:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt approved successfully',
      prompt: data,
    });
  } catch (error) {
    console.error('[Approve Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve prompt' },
      { status: 500 }
    );
  }
}
