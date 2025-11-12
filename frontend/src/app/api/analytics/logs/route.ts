import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/analytics/logs
// Returns all usage logs for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    // Fetch all usage logs with prompt information
    const { data: logs, error } = await supabase
      .from('ai_usage_logs')
      .select(`
        created_at,
        provider,
        model,
        operation_type,
        input_tokens,
        output_tokens,
        total_tokens,
        cost_usd,
        latency_ms,
        success,
        error_message,
        prompt_id,
        prompts(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000); // Limit to last 1000 logs for performance

    if (error) throw error;

    return NextResponse.json({
      logs: logs || [],
      count: logs?.length || 0,
    });
  } catch (error) {
    console.error('[Analytics Logs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage logs' },
      { status: 500 }
    );
  }
}
