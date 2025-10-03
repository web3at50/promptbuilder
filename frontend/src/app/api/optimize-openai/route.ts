import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated (for tracking usage)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Call OpenAI API to optimise
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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

    const optimizedPrompt = completion.choices[0]?.message?.content || prompt;

    // Track usage if user is authenticated
    if (user) {
      await supabase.from('optimization_usage').insert([
        {
          user_id: user.id,
        },
      ]);
    }

    return NextResponse.json({ optimizedPrompt });
  } catch (error) {
    console.error('Error optimising prompt with OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to optimise prompt' },
      { status: 500 }
    );
  }
}
