import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// POST /api/prompts/[id]/unpublish
// Unpublishes a prompt from the community gallery
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

    // Verify prompt ownership
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, user_id, is_public')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found or access denied' },
        { status: 404 }
      );
    }

    if (!prompt.is_public) {
      return NextResponse.json(
        { error: 'Prompt is not published' },
        { status: 400 }
      );
    }

    // Delete from community_prompts (CASCADE will handle likes and forks)
    const { error: deleteError } = await supabase
      .from('community_prompts')
      .delete()
      .eq('prompt_id', id);

    if (deleteError) {
      console.error('Error deleting community prompt:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unpublish prompt' },
        { status: 500 }
      );
    }

    // Update prompts table (keep share_token for potential republishing)
    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        is_public: false,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating prompt:', updateError);
      return NextResponse.json(
        { error: 'Failed to update prompt status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt unpublished successfully!',
    });
  } catch (error) {
    console.error('[Unpublish Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to unpublish prompt' },
      { status: 500 }
    );
  }
}
