import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { isAdmin } from '@/lib/admin';

// GET /api/admin/pending-prompts
// List all prompts with moderation status (pending, approved, rejected)
export async function GET(request: NextRequest) {
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

    // Get filter from query params (default: pending)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Build query - no need for author names in moderation
    let query = supabase
      .from('community_prompts')
      .select(`
        id,
        title,
        description,
        content,
        category,
        tags,
        moderation_status,
        moderation_scores,
        moderation_flagged_for,
        moderation_notes,
        reviewed_at,
        reviewed_by,
        published_at,
        updated_at
      `)
      .order('published_at', { ascending: false });

    // Filter by status if not 'all'
    if (status !== 'all') {
      query = query.eq('moderation_status', status);
    }

    const { data: prompts, error } = await query;

    if (error) {
      console.error('Error fetching pending prompts:', error);
      throw error;
    }

    // Get counts for each status
    const { data: counts } = await supabase
      .from('community_prompts')
      .select('moderation_status')
      .neq('moderation_status', null);

    const statusCounts = {
      pending: counts?.filter((c) => c.moderation_status === 'pending').length || 0,
      auto_approved: counts?.filter((c) => c.moderation_status === 'auto_approved').length || 0,
      approved: counts?.filter((c) => c.moderation_status === 'approved').length || 0,
      rejected: counts?.filter((c) => c.moderation_status === 'rejected').length || 0,
    };

    return NextResponse.json({
      prompts: prompts || [],
      counts: statusCounts,
    });
  } catch (error) {
    console.error('[Admin Pending Prompts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending prompts' },
      { status: 500 }
    );
  }
}
