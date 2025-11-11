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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const MODEL = 'gpt-4o';
  const timer = startTimer();
  let supabase: Awaited<ReturnType<typeof createClerkSupabaseClient>>;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { prompt, promptId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    supabase = await createClerkSupabaseClient();

    // If promptId provided, store original prompt and update metadata
    if (promptId) {
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

        await supabase
          .from('prompts')
          .update(updates)
          .eq('id', promptId);
      }
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
