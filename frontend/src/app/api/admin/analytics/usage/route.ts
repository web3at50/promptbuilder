import { NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { requireAdmin } from '@/lib/admin';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface UsageDataItem {
  date: string;
  total_tokens: number;
  anthropic_tokens: number;
  openai_tokens: number;
  total_requests: number;
  anthropic_requests: number;
  openai_requests: number;
}

export async function GET(request: Request) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || 'daily') as TimeRange;

    const supabase = await createClerkSupabaseClient();

    // Fetch all logs
    const { data: logs, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching usage data:', error);
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
    }

    // Group by time range and provider
    const groupedData = logs.reduce((acc, log) => {
      const date = new Date(log.created_at);
      let key: string;

      if (range === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (range === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          total_tokens: 0,
          anthropic_tokens: 0,
          openai_tokens: 0,
          total_requests: 0,
          anthropic_requests: 0,
          openai_requests: 0,
        };
      }

      const tokens = log.total_tokens || 0;
      acc[key].total_tokens += tokens;
      acc[key].total_requests += 1;

      if (log.provider === 'anthropic') {
        acc[key].anthropic_tokens += tokens;
        acc[key].anthropic_requests += 1;
      } else if (log.provider === 'openai') {
        acc[key].openai_tokens += tokens;
        acc[key].openai_requests += 1;
      }

      return acc;
    }, {} as Record<string, UsageDataItem>);

    // Convert to array and sort by date
    const usageData = Object.values(groupedData).sort((a: UsageDataItem, b: UsageDataItem) =>
      a.date.localeCompare(b.date)
    );

    // Limit to last 30 days/weeks/months depending on range
    const limit = range === 'daily' ? 30 : range === 'weekly' ? 12 : 12;
    const limitedData = usageData.slice(-limit);

    return NextResponse.json({
      data: limitedData,
      range,
    });
  } catch (error) {
    console.error('Error in admin usage API:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
