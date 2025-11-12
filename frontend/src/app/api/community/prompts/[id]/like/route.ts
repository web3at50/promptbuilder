import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// POST /api/community/prompts/[id]/like
// Toggles like on a community prompt
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();
    const { id } = await params;

    // Check if prompt exists
    const { data: prompt, error: promptError } = await supabase
      .from('community_prompts')
      .select('id, like_count')
      .eq('id', id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked this prompt
    const { data: existingLike } = await supabase
      .from('community_prompt_likes')
      .select('id')
      .eq('community_prompt_id', id)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike: delete the like
      const { error: deleteError } = await supabase
        .from('community_prompt_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        return NextResponse.json(
          { error: 'Failed to unlike prompt' },
          { status: 500 }
        );
      }

      // Decrement like count
      const { error: updateError } = await supabase
        .from('community_prompts')
        .update({ like_count: Math.max(0, (prompt.like_count || 0) - 1) })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating like count:', updateError);
      }

      return NextResponse.json({
        success: true,
        liked: false,
        like_count: Math.max(0, (prompt.like_count || 0) - 1),
      });
    } else {
      // Like: insert new like
      const { error: insertError } = await supabase
        .from('community_prompt_likes')
        .insert({
          community_prompt_id: id,
          user_id: userId,
        });

      if (insertError) {
        console.error('Error inserting like:', insertError);
        return NextResponse.json(
          { error: 'Failed to like prompt' },
          { status: 500 }
        );
      }

      // Increment like count
      const { error: updateError } = await supabase
        .from('community_prompts')
        .update({ like_count: (prompt.like_count || 0) + 1 })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating like count:', updateError);
      }

      return NextResponse.json({
        success: true,
        liked: true,
        like_count: (prompt.like_count || 0) + 1,
      });
    }
  } catch (error) {
    console.error('[Like Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
