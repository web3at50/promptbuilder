import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { isAdmin } from '@/lib/admin';

// GET all prompts (user-scoped)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST create new prompt
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags = [], favorite = false } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // Check if user is admin (unlimited prompts)
    const userIsAdmin = await isAdmin();

    // If not admin, check prompt limit (10 prompts max)
    if (!userIsAdmin) {
      const { count, error: countError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        console.error('Error checking prompt count:', countError);
        return NextResponse.json(
          { error: 'Failed to check prompt limit' },
          { status: 500 }
        );
      }

      const promptCount = count || 0;

      if (promptCount >= 10) {
        return NextResponse.json(
          {
            error: 'Prompt limit reached',
            message: 'You have reached the maximum of 10 prompts. Please contact support@syntorak.com to upgrade your account.',
            limit: 10,
            current: promptCount
          },
          { status: 429 }
        );
      }
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert([
        {
          title,
          content,
          tags,
          favorite,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
