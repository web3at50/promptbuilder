import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/analytics/usage
// Returns token usage statistics and breakdown by provider
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    // Get all usage logs
    const { data: usageLogs, error } = await supabase
      .from('ai_usage_logs')
      .select('input_tokens, output_tokens, provider, cost_usd, created_at')
      .eq('user_id', userId)
      .eq('success', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!usageLogs || usageLogs.length === 0) {
      return NextResponse.json({
        total_tokens: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        by_provider: {
          anthropic: { tokens: 0, input: 0, output: 0, count: 0 },
          openai: { tokens: 0, input: 0, output: 0, count: 0 },
        },
        avg_tokens_per_optimization: 0,
        daily_usage: [],
      });
    }

    // Calculate totals
    const totalInputTokens = usageLogs.reduce((sum, log) => sum + (log.input_tokens || 0), 0);
    const totalOutputTokens = usageLogs.reduce((sum, log) => sum + (log.output_tokens || 0), 0);
    const totalTokens = totalInputTokens + totalOutputTokens;

    // Calculate by provider
    const byProvider = usageLogs.reduce(
      (acc, log) => {
        const provider = log.provider as 'anthropic' | 'openai';
        const input = log.input_tokens || 0;
        const output = log.output_tokens || 0;

        acc[provider].input += input;
        acc[provider].output += output;
        acc[provider].tokens += input + output;
        acc[provider].count += 1;

        return acc;
      },
      {
        anthropic: { tokens: 0, input: 0, output: 0, count: 0 },
        openai: { tokens: 0, input: 0, output: 0, count: 0 },
      }
    );

    // Calculate average tokens per optimization
    const avgTokensPerOptimization = Math.round(totalTokens / usageLogs.length);

    // Group by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsage: Record<string, { date: string; tokens: number; cost: number; count: number }> = {};

    usageLogs
      .filter((log) => new Date(log.created_at) >= thirtyDaysAgo)
      .forEach((log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];

        if (!dailyUsage[date]) {
          dailyUsage[date] = { date, tokens: 0, cost: 0, count: 0 };
        }

        dailyUsage[date].tokens += (log.input_tokens || 0) + (log.output_tokens || 0);
        dailyUsage[date].cost += Number(log.cost_usd);
        dailyUsage[date].count += 1;
      });

    const dailyUsageArray = Object.values(dailyUsage)
      .map((item) => ({
        ...item,
        cost: Number(item.cost.toFixed(4)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      total_tokens: totalTokens,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      by_provider: byProvider,
      avg_tokens_per_optimization: avgTokensPerOptimization,
      daily_usage: dailyUsageArray,
    });
  } catch (error) {
    console.error('[Analytics Usage] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage analytics' },
      { status: 500 }
    );
  }
}
