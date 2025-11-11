import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import {
  createAnthropicUsageLog,
  createErrorUsageLog,
  logAIUsage,
  startTimer,
} from '@/lib/usage-logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  const MODEL = 'claude-sonnet-4-5-20250929';
  const timer = startTimer();
  let supabase: Awaited<ReturnType<typeof createClerkSupabaseClient>> | undefined;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { prompt, promptId } = await request.json();

    console.log('[Optimize API] Received request with promptId:', promptId, 'Type:', typeof promptId);
    console.log('[Optimize API] promptId is truthy?', !!promptId);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    supabase = await createClerkSupabaseClient();

    // If promptId provided, store original prompt and update metadata
    if (promptId) {
      console.log('[Optimize API] promptId exists - will update prompt metadata');
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('content, original_prompt, optimization_count')
        .eq('id', promptId)
        .single();

      if (existingPrompt) {
        // Only store original_prompt if this is the first optimization
        const updates: {
          optimization_count: number;
          last_optimized_at: string;
          optimized_with: string;
          original_prompt?: string;
        } = {
          optimization_count: (existingPrompt.optimization_count || 0) + 1,
          last_optimized_at: new Date().toISOString(),
          optimized_with: MODEL,
        };

        if (!existingPrompt.original_prompt) {
          updates.original_prompt = existingPrompt.content;
        }

        const { error: updateError } = await supabase
          .from('prompts')
          .update(updates)
          .eq('id', promptId);

        if (updateError) {
          console.error('[Optimize API] Failed to update prompt metadata:', updateError);
        } else {
          console.log('[Optimize API] Successfully updated prompt metadata for promptId:', promptId);
        }
      } else {
        console.log('[Optimize API] No existing prompt found for promptId:', promptId);
      }
    } else {
      console.log('[Optimize API] No promptId provided - skipping prompt metadata update');
    }

    // Call Claude API to optimize - start measuring latency
    const apiTimer = startTimer();
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert at optimising AI prompts. Your task is to improve the following prompt to make it clearer, more effective, and more likely to produce high-quality results.

Analyse the prompt and provide an improved version that:
1. Is more specific and detailed
2. Uses clear and unambiguous language
3. Includes relevant context and constraints
4. Follows best practices for prompt engineering
5. Maintains the original intent

Original prompt:
${prompt}

Please provide ONLY the optimised prompt without any explanation or meta-commentary. Just return the improved prompt text.`,
        },
      ],
    });
    const latencyMs = apiTimer.stop();

    const optimizedPrompt =
      message.content[0].type === 'text' ? message.content[0].text : prompt;

    // Log comprehensive usage data to ai_usage_logs
    const usageLog = createAnthropicUsageLog(
      userId,
      message,
      latencyMs,
      promptId
    );
    await logAIUsage(supabase, usageLog);

    return NextResponse.json({
      optimizedPrompt,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        costUsd: usageLog.cost_usd,
        latencyMs,
      },
    });
  } catch (error) {
    const latencyMs = timer.stop();
    console.error('Error optimising prompt:', error);

    // Log error to ai_usage_logs if we have supabase connection
    if (supabase) {
      try {
        const { userId } = await auth();
        if (userId) {
          const errorLog = createErrorUsageLog(
            userId,
            'anthropic',
            MODEL,
            error instanceof Error ? error.message : 'Unknown error',
            latencyMs
          );
          await logAIUsage(supabase, errorLog);
        }
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to optimise prompt' },
      { status: 500 }
    );
  }
}
