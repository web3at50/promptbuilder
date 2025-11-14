import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import {
  createAnthropicUsageLog,
  createOpenAIUsageLog,
  logAIUsage,
  startTimer,
} from '@/lib/usage-logger';

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
const OPENAI_MODEL = 'gpt-4o';

const OPTIMIZATION_PROMPT = (prompt: string) => `You are an expert at optimising AI prompts. Your task is to improve the following prompt to make it clearer, more effective, and more likely to produce high-quality results.

Analyse the prompt and provide an improved version that:
1. Is more specific and detailed
2. Uses clear and unambiguous language
3. Includes relevant context and constraints
4. Follows best practices for prompt engineering
5. Maintains the original intent

Original prompt:
${prompt}

Please provide ONLY the optimised prompt without any explanation or meta-commentary. Just return the improved prompt text.`;

/**
 * POST /api/prompts/[id]/compare-both
 * Run both Claude and ChatGPT optimizations in parallel and return results for comparison
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const totalTimer = startTimer();
  let supabase: Awaited<ReturnType<typeof createClerkSupabaseClient>> | undefined;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: promptId } = await params;
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    supabase = await createClerkSupabaseClient();

    // Verify prompt ownership and get current state
    const { data: existingPrompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, user_id, content, original_prompt, optimization_count')
      .eq('id', promptId)
      .single();

    if (promptError || !existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    if (existingPrompt.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate next version number (will be same for both providers)
    const nextVersion = (existingPrompt.optimization_count || 0) + 1;
    const inputText = existingPrompt.content;

    // Save original_prompt if this is the first optimization
    if (!existingPrompt.original_prompt) {
      await supabase
        .from('prompts')
        .update({ original_prompt: existingPrompt.content })
        .eq('id', promptId)
        .eq('user_id', userId);
    }

    // Initialize API clients
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Run both optimizations in parallel
    console.log('[Compare Both] Running parallel optimizations for prompt:', promptId);

    const [claudeResult, openaiResult] = await Promise.allSettled([
      // Claude optimization
      (async () => {
        const timer = startTimer();
        try {
          const message = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 4096,
            messages: [
              {
                role: 'user',
                content: OPTIMIZATION_PROMPT(prompt),
              },
            ],
          });
          const latency = timer.stop();
          const optimizedText = message.content[0].type === 'text' ? message.content[0].text : prompt;

          const usageLog = createAnthropicUsageLog(userId, message, latency, promptId);
          await logAIUsage(supabase!, usageLog);

          return {
            provider: 'anthropic' as const,
            model: CLAUDE_MODEL,
            output: optimizedText,
            tokens_input: message.usage.input_tokens,
            tokens_output: message.usage.output_tokens,
            cost_usd: usageLog.cost_usd,
            latency_ms: latency,
            success: true,
          };
        } catch (error) {
          console.error('[Compare Both] Claude optimization failed:', error);
          throw error;
        }
      })(),

      // OpenAI optimization
      (async () => {
        const timer = startTimer();
        try {
          const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
              {
                role: 'user',
                content: OPTIMIZATION_PROMPT(prompt),
              },
            ],
          });
          const latency = timer.stop();
          const optimizedText = completion.choices[0]?.message?.content || prompt;

          const usageLog = createOpenAIUsageLog(userId, completion, latency, promptId);
          await logAIUsage(supabase!, usageLog);

          return {
            provider: 'openai' as const,
            model: OPENAI_MODEL,
            output: optimizedText,
            tokens_input: completion.usage?.prompt_tokens || 0,
            tokens_output: completion.usage?.completion_tokens || 0,
            cost_usd: usageLog.cost_usd,
            latency_ms: latency,
            success: true,
          };
        } catch (error) {
          console.error('[Compare Both] OpenAI optimization failed:', error);
          throw error;
        }
      })(),
    ]);

    // Check if both succeeded
    const claude = claudeResult.status === 'fulfilled' ? claudeResult.value : null;
    const openaiData = openaiResult.status === 'fulfilled' ? openaiResult.value : null;

    if (!claude && !openaiData) {
      return NextResponse.json(
        { error: 'Both optimizations failed' },
        { status: 500 }
      );
    }

    // Save successful optimizations to history (don't block on errors)
    const historyPromises = [];

    if (claude && supabase) {
      historyPromises.push(
        supabase.from('prompt_optimizations').insert({
          prompt_id: promptId,
          version: nextVersion,
          provider: 'anthropic',
          model: CLAUDE_MODEL,
          input_text: inputText,
          output_text: claude.output,
          tokens_input: claude.tokens_input,
          tokens_output: claude.tokens_output,
          cost_usd: claude.cost_usd,
          latency_ms: claude.latency_ms,
          user_id: userId,
        })
      );
    }

    if (openaiData && supabase) {
      historyPromises.push(
        supabase.from('prompt_optimizations').insert({
          prompt_id: promptId,
          version: nextVersion,
          provider: 'openai',
          model: OPENAI_MODEL,
          input_text: inputText,
          output_text: openaiData.output,
          tokens_input: openaiData.tokens_input,
          tokens_output: openaiData.tokens_output,
          cost_usd: openaiData.cost_usd,
          latency_ms: openaiData.latency_ms,
          user_id: userId,
        })
      );
    }

    // Wait for history saves (but don't fail if they error)
    try {
      await Promise.all(historyPromises);
      console.log('[Compare Both] Saved both optimizations to history as version', nextVersion);
    } catch (historyError) {
      console.error('[Compare Both] Failed to save optimization history:', historyError);
      // Continue anyway - optimizations succeeded
    }

    const totalTime = totalTimer.stop();

    return NextResponse.json({
      version: nextVersion,
      claude: claude ? {
        output: claude.output,
        tokens_input: claude.tokens_input,
        tokens_output: claude.tokens_output,
        cost_usd: claude.cost_usd,
        latency_ms: claude.latency_ms,
        model: claude.model,
      } : null,
      openai: openaiData ? {
        output: openaiData.output,
        tokens_input: openaiData.tokens_input,
        tokens_output: openaiData.tokens_output,
        cost_usd: openaiData.cost_usd,
        latency_ms: openaiData.latency_ms,
        model: openaiData.model,
      } : null,
      total_time_ms: totalTime,
      errors: {
        claude: claudeResult.status === 'rejected' ? 'Failed to optimize with Claude' : null,
        openai: openaiResult.status === 'rejected' ? 'Failed to optimize with OpenAI' : null,
      },
    });
  } catch (error) {
    console.error('[Compare Both] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to run dual optimization' },
      { status: 500 }
    );
  }
}
