import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert at optimizing AI prompts. Your task is to improve the following prompt to make it clearer, more effective, and more likely to produce high-quality results.

Analyze the prompt and provide an improved version that:
1. Is more specific and detailed
2. Uses clear and unambiguous language
3. Includes relevant context and constraints
4. Follows best practices for prompt engineering
5. Maintains the original intent

Original prompt:
${prompt}

Please provide ONLY the optimized prompt without any explanation or meta-commentary. Just return the improved prompt text.`,
        },
      ],
    });

    const optimizedPrompt =
      message.content[0].type === 'text' ? message.content[0].text : prompt;

    return NextResponse.json({ optimizedPrompt });
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to optimize prompt' },
      { status: 500 }
    );
  }
}
