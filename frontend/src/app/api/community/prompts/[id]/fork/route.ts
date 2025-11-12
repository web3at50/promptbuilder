import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// POST /api/community/prompts/[id]/fork
// Forks a community prompt to user's personal library
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

    // Get the community prompt details
    const { data: communityPrompt, error: promptError } = await supabase
      .from('community_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (promptError || !communityPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Check if user already forked this prompt
    const { data: existingFork } = await supabase
      .from('community_prompt_forks')
      .select('forked_prompt_id')
      .eq('community_prompt_id', id)
      .eq('user_id', userId)
      .single();

    if (existingFork) {
      // Already forked, return existing prompt
      return NextResponse.json({
        success: true,
        already_forked: true,
        prompt_id: existingFork.forked_prompt_id,
      });
    }

    // Create a new prompt in user's library
    const { data: newPrompt, error: insertError } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        title: communityPrompt.title,
        content: communityPrompt.content,
        category: communityPrompt.category,
        tags: communityPrompt.tags,
        is_public: false, // Forked prompts are private by default
        favorite: false,
      })
      .select()
      .single();

    if (insertError || !newPrompt) {
      console.error('Error creating forked prompt:', insertError);
      return NextResponse.json(
        { error: 'Failed to fork prompt' },
        { status: 500 }
      );
    }

    // Record the fork relationship
    const { error: forkError } = await supabase
      .from('community_prompt_forks')
      .insert({
        community_prompt_id: id,
        user_id: userId,
        forked_prompt_id: newPrompt.id,
      });

    if (forkError) {
      console.error('Error recording fork:', forkError);
      // Continue even if this fails - user has the prompt
    }

    // Increment fork count
    const { error: updateError } = await supabase
      .from('community_prompts')
      .update({ fork_count: (communityPrompt.fork_count || 0) + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating fork count:', updateError);
    }

    return NextResponse.json({
      success: true,
      prompt_id: newPrompt.id,
      fork_count: (communityPrompt.fork_count || 0) + 1,
    });
  } catch (error) {
    console.error('[Fork Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fork prompt' },
      { status: 500 }
    );
  }
}
