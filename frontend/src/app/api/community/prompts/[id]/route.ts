import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/community/prompts/[id]
// Gets a single community prompt and increments view count
// Public endpoint - no auth required for viewing
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const supabase = await createClerkSupabaseClient();
    const { id } = await params;

    // Get the community prompt
    const { data: prompt, error } = await supabase
      .from('community_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Increment view count (but not for the author or unauthenticated users)
    if (userId && prompt.user_id !== userId) {
      await supabase
        .from('community_prompts')
        .update({ view_count: (prompt.view_count || 0) + 1 })
        .eq('id', id);

      prompt.view_count = (prompt.view_count || 0) + 1;
    }

    // Check if user has liked this prompt (only if authenticated)
    let isLiked = false;
    let isForked = false;
    let forkedPromptId = null;

    if (userId) {
      const { data: userLike } = await supabase
        .from('community_prompt_likes')
        .select('id')
        .eq('community_prompt_id', id)
        .eq('user_id', userId)
        .single();

      // Check if user has forked this prompt
      const { data: userFork } = await supabase
        .from('community_prompt_forks')
        .select('id, forked_prompt_id')
        .eq('community_prompt_id', id)
        .eq('user_id', userId)
        .single();

      isLiked = !!userLike;
      isForked = !!userFork;
      forkedPromptId = userFork?.forked_prompt_id || null;
    }

    return NextResponse.json({
      ...prompt,
      is_liked_by_user: isLiked,
      is_forked_by_user: isForked,
      forked_prompt_id: forkedPromptId,
    });
  } catch (error) {
    console.error('[Community Prompt Detail] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}
