import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

/**
 * GET /api/prompts/[id]/optimizations
 * Fetch all optimization history for a prompt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // First verify the prompt belongs to this user
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (prompt.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch all optimizations for this prompt, ordered by version descending (latest first)
    const { data: optimizations, error } = await supabase
      .from('prompt_optimizations')
      .select('*')
      .eq('prompt_id', id)
      .order('version', { ascending: false })
      .limit(50); // Limit to latest 50 versions

    if (error) {
      console.error('[Optimizations API] Error fetching history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch optimization history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      optimizations: optimizations || [],
      total: optimizations?.length || 0,
    });
  } catch (error) {
    console.error('[Optimizations API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
