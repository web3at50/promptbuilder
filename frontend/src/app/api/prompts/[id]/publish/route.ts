import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { nanoid } from 'nanoid';
import { validateDescription } from '@/lib/validation';
import {
  moderateContent,
  analyzeModerationResult,
  getRejectionMessage,
  getPendingMessage,
} from '@/lib/moderation';

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

    // Validate description with length limit
    const validationError = validateDescription(description);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.message },
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

    // Moderate content before publishing
    let moderationStatus = 'auto_approved';
    let moderationScores = null;
    let moderationFlaggedFor: string[] = [];

    try {
      // Combine all text for moderation
      const contentToModerate = `${prompt.title}\n\n${description.trim()}\n\n${prompt.content}`;

      const moderationResult = await moderateContent(contentToModerate);
      const decision = analyzeModerationResult(moderationResult);

      moderationStatus = decision.status;
      moderationScores = decision.scores;
      moderationFlaggedFor = decision.flaggedCategories;

      // If rejected, return error immediately
      if (decision.status === 'rejected') {
        return NextResponse.json(
          {
            error: getRejectionMessage(decision.flaggedCategories),
            moderation: {
              flagged: true,
              categories: decision.flaggedCategories,
            },
          },
          { status: 400 }
        );
      }
    } catch (error) {
      // If moderation API fails, auto-approve (fail open)
      console.error('[Publish] Moderation API failed, auto-approving:', error);
      moderationStatus = 'auto_approved';
    }

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
        moderation_status: moderationStatus,
        moderation_scores: moderationScores,
        moderation_flagged_for: moderationFlaggedFor,
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

    // Return success with appropriate message based on moderation status
    const responseMessage =
      moderationStatus === 'pending'
        ? getPendingMessage()
        : 'Prompt published successfully!';

    return NextResponse.json({
      success: true,
      message: responseMessage,
      share_token,
      community_prompt_id: communityPrompt.id,
      public_url: `/community/${communityPrompt.id}`,
      moderation_status: moderationStatus,
      requires_review: moderationStatus === 'pending',
    });
  } catch (error) {
    console.error('[Publish Prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to publish prompt' },
      { status: 500 }
    );
  }
}
