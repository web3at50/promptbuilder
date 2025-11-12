import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { isAdmin } from '@/lib/admin';

// GET prompt count and limit info
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    // Check if user is admin
    const userIsAdmin = await isAdmin();

    // Get current prompt count
    const { count, error } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking prompt count:', error);
      return NextResponse.json(
        { error: 'Failed to check prompt count' },
        { status: 500 }
      );
    }

    const promptCount = count || 0;
    const limit = userIsAdmin ? null : 10; // null means unlimited for admins
    const canCreate = userIsAdmin || promptCount < 10;

    return NextResponse.json({
      count: promptCount,
      limit,
      canCreate,
      isAdmin: userIsAdmin,
    });
  } catch (error) {
    console.error('Error in prompt count API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
