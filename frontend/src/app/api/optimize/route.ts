import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call Claude API to optimise
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
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

    const optimizedPrompt =
      message.content[0].type === 'text' ? message.content[0].text : prompt;

    // Track usage
    const supabase = await createClerkSupabaseClient();
    await supabase.from('optimization_usage').insert([
      {
        user_id: userId,
      },
    ]);

    return NextResponse.json({ optimizedPrompt });
  } catch (error) {
    console.error('Error optimising prompt:', error);
    return NextResponse.json(
      { error: 'Failed to optimise prompt' },
      { status: 500 }
    );
  }
}
