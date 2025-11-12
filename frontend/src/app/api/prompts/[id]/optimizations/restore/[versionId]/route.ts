import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

/**
 * POST /api/prompts/[id]/optimizations/restore/[versionId]
 * Restore a specific optimization version as the current prompt content
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id, versionId } = await params;

    if (!id || !versionId) {
      return NextResponse.json(
        { error: 'Prompt ID and Version ID are required' },
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

    // Get the optimization version to restore
    const { data: optimization, error: optError } = await supabase
      .from('prompt_optimizations')
      .select('output_text, provider, model, version')
      .eq('id', versionId)
      .eq('prompt_id', id)
      .single();

    if (optError || !optimization) {
      return NextResponse.json(
        { error: 'Optimization version not found' },
        { status: 404 }
      );
    }

    // Update the prompt's content with the restored version
    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        content: optimization.output_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Restore API] Error updating prompt:', updateError);
      return NextResponse.json(
        { error: 'Failed to restore version' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Restored version ${optimization.version} (${optimization.provider})`,
      content: optimization.output_text,
    });
  } catch (error) {
    console.error('[Restore API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
