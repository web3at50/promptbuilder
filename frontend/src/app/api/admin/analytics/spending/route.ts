import { NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { requireAdmin } from '@/lib/admin';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface SpendingDataItem {
  date: string;
  total_cost: number;
  anthropic_cost: number;
  openai_cost: number;
  total_requests: number;
  total_tokens: number;
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
      console.error('Error fetching spending data:', error);
      return NextResponse.json({ error: 'Failed to fetch spending data' }, { status: 500 });
    }

    // Group by time range
    const groupedData = logs.reduce((acc, log) => {
      const date = new Date(log.created_at);
      let key: string;

      if (range === 'daily') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (range === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          total_cost: 0,
          anthropic_cost: 0,
          openai_cost: 0,
          total_requests: 0,
          total_tokens: 0,
        };
      }

      const cost = parseFloat(log.cost_usd) || 0;
      acc[key].total_cost += cost;
      acc[key].total_requests += 1;
      acc[key].total_tokens += log.total_tokens || 0;

      if (log.provider === 'anthropic') {
        acc[key].anthropic_cost += cost;
      } else if (log.provider === 'openai') {
        acc[key].openai_cost += cost;
      }

      return acc;
    }, {} as Record<string, SpendingDataItem>);

    // Convert to array and sort by date
    const spendingData = Object.values(groupedData).sort((a: SpendingDataItem, b: SpendingDataItem) =>
      a.date.localeCompare(b.date)
    );

    // Limit to last 30 days/weeks/months depending on range
    const limit = range === 'daily' ? 30 : range === 'weekly' ? 12 : 12;
    const limitedData = spendingData.slice(-limit);

    return NextResponse.json({
      data: limitedData,
      range,
    });
  } catch (error) {
    console.error('Error in admin spending API:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
