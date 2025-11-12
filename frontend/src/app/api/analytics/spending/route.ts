import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/analytics/spending?period=daily|weekly|monthly
// Returns cost breakdown over time by provider
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly

    const supabase = await createClerkSupabaseClient();

    // Get all usage logs for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usageLogs, error } = await supabase
      .from('ai_usage_logs')
      .select('created_at, cost_usd, provider')
      .eq('user_id', userId)
      .eq('success', true)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date and provider
    const spendingByDate: Record<string, { anthropic: number; openai: number; total: number }> = {};

    usageLogs?.forEach((log) => {
      const date = new Date(log.created_at);
      let dateKey: string;

      if (period === 'monthly') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        // Get the Monday of the week
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        dateKey = monday.toISOString().split('T')[0];
      } else {
        // daily
        dateKey = date.toISOString().split('T')[0];
      }

      if (!spendingByDate[dateKey]) {
        spendingByDate[dateKey] = { anthropic: 0, openai: 0, total: 0 };
      }

      const cost = Number(log.cost_usd);
      spendingByDate[dateKey][log.provider as 'anthropic' | 'openai'] += cost;
      spendingByDate[dateKey].total += cost;
    });

    // Convert to array and sort by date
    const spendingData = Object.entries(spendingByDate)
      .map(([date, costs]) => ({
        date,
        anthropic: Number(costs.anthropic.toFixed(4)),
        openai: Number(costs.openai.toFixed(4)),
        total: Number(costs.total.toFixed(4)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate provider totals
    const totalByProvider = spendingData.reduce(
      (acc, item) => {
        acc.anthropic += item.anthropic;
        acc.openai += item.openai;
        return acc;
      },
      { anthropic: 0, openai: 0 }
    );

    return NextResponse.json({
      period,
      data: spendingData,
      totals: {
        anthropic: Number(totalByProvider.anthropic.toFixed(4)),
        openai: Number(totalByProvider.openai.toFixed(4)),
        total: Number((totalByProvider.anthropic + totalByProvider.openai).toFixed(4)),
      },
    });
  } catch (error) {
    console.error('[Analytics Spending] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending analytics' },
      { status: 500 }
    );
  }
}
