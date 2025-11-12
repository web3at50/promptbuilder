import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { nanoid } from 'nanoid';

// POST /api/prompts/[id]/publish
// Publishes a prompt to the community gallery
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const { description, category } = body;

    // Validate required fields
    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Get the prompt to publish
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found or access denied' },
        { status: 404 }
      );
    }

    // Check if already published
    const { data: existingPublished } = await supabase
      .from('community_prompts')
      .select('id, share_token')
      .eq('prompt_id', id)
      .single();

    if (existingPublished) {
      return NextResponse.json(
        {
          error: 'Prompt is already published',
          share_token: existingPublished.share_token
        },
        { status: 409 }
      );
    }

    // Generate unique share token
    const share_token = nanoid(12);

    // Insert into community_prompts
    const { data: communityPrompt, error: communityError } = await supabase
      .from('community_prompts')
      .insert({
        prompt_id: id,
        user_id: userId,
        title: prompt.title,
        description: description.trim(),
        content: prompt.content,
        tags: prompt.tags || [],
        category: category || null,
        share_token,
        like_count: 0,
        fork_count: 0,
        view_count: 0,
        is_featured: false,
      })
      .select()
      .single();

    if (communityError) {
      console.error('Error creating community prompt:', communityError);
      return NextResponse.json(
        { error: 'Failed to publish prompt' },
        { status: 500 }
      );
    }

    // Update prompts table
    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        share_token,
        is_public: true,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating prompt:', updateError);
      // Rollback community prompt if update fails
      await supabase
        .from('community_prompts')
        .delete()
        .eq('id', communityPrompt.id);

      return NextResponse.json(
        { error: 'Failed to update prompt status' },
        { status: 500 }
      );
    }

    // Return success with public URL
    return NextResponse.json({
      success: true,
      message: 'Prompt published successfully!',
      share_token,
      community_prompt_id: communityPrompt.id,
      public_url: `/community/${communityPrompt.id}`,
    });
  } catch (error) {
    console.error('[Publish Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to publish prompt' },
      { status: 500 }
    );
  }
}
