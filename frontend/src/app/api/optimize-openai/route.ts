import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import {
  createOpenAIUsageLog,
  createErrorUsageLog,
  logAIUsage,
  startTimer,
} from '@/lib/usage-logger';

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
  const MODEL = 'gpt-4o';
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

    console.log('[OpenAI API] Received request with promptId:', promptId, 'Type:', typeof promptId);
    console.log('[OpenAI API] promptId is truthy?', !!promptId);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    supabase = await createClerkSupabaseClient();

    // Get current optimization data if promptId provided
    let nextVersion = 1;
    let inputText = prompt;

    if (promptId) {
      console.log('[OpenAI API] promptId exists - will update prompt metadata');
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('content, original_prompt, optimization_count')
        .eq('id', promptId)
        .single();

      if (existingPrompt) {
        // Calculate next version number based on existing count
        nextVersion = (existingPrompt.optimization_count || 0) + 1;
        inputText = existingPrompt.content; // Save what we're actually sending to the LLM

        // Only store original_prompt if this is the first optimization
        const updates: {
          optimization_count: number;
          last_optimized_at: string;
          optimized_with: string;
          original_prompt?: string;
        } = {
          optimization_count: nextVersion,
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
          console.error('[OpenAI API] Failed to update prompt metadata:', updateError);
        } else {
          console.log('[OpenAI API] Successfully updated prompt metadata for promptId:', promptId);
        }
      } else {
        console.log('[OpenAI API] No existing prompt found for promptId:', promptId);
      }
    } else {
      console.log('[OpenAI API] No promptId provided - skipping prompt metadata update');
    }

    // Call OpenAI API to optimize - start measuring latency
    const apiTimer = startTimer();
    const completion = await openai.chat.completions.create({
      model: MODEL,
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

    const optimizedPrompt = completion.choices[0]?.message?.content || prompt;

    // Log comprehensive usage data to ai_usage_logs
    const usageLog = createOpenAIUsageLog(
      userId,
      completion,
      latencyMs,
      promptId
    );
    await logAIUsage(supabase, usageLog);

    // Save to optimization history (Phase 2)
    if (promptId && supabase) {
      try {
        const { error: historyError } = await supabase
          .from('prompt_optimizations')
          .insert({
            prompt_id: promptId,
            version: nextVersion,
            provider: 'openai',
            model: MODEL,
            input_text: inputText,
            output_text: optimizedPrompt,
            tokens_input: completion.usage?.prompt_tokens || null,
            tokens_output: completion.usage?.completion_tokens || null,
            cost_usd: usageLog.cost_usd,
            latency_ms: latencyMs,
            user_id: userId,
          });

        if (historyError) {
          console.error('[OpenAI API] Failed to save optimization history:', historyError);
          // Don't fail the request if history save fails
        } else {
          console.log('[OpenAI API] Saved optimization v' + nextVersion + ' to history');
        }
      } catch (historyErr) {
        console.error('[OpenAI API] Exception saving history:', historyErr);
        // Don't fail the request
      }
    }

    return NextResponse.json({
      optimizedPrompt,
      usage: {
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        costUsd: usageLog.cost_usd,
        latencyMs,
      },
    });
  } catch (error) {
    const latencyMs = timer.stop();
    console.error('Error optimising prompt with OpenAI:', error);

    // Log error to ai_usage_logs if we have supabase connection
    if (supabase) {
      try {
        const { userId } = await auth();
        if (userId) {
          const errorLog = createErrorUsageLog(
            userId,
            'openai',
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
