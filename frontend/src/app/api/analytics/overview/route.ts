import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/analytics/overview
// Returns overview statistics for the authenticated user's AI usage
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    // Get total prompts count
    const { count: totalPrompts } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get total optimizations count and cost
    const { data: usageStats } = await supabase
      .from('ai_usage_logs')
      .select('cost_usd, input_tokens, output_tokens, provider')
      .eq('user_id', userId)
      .eq('operation_type', 'optimize')
      .eq('success', true);

    const totalOptimizations = usageStats?.length || 0;
    const totalCost = usageStats?.reduce((sum, log) => sum + Number(log.cost_usd), 0) || 0;
    const totalTokens = usageStats?.reduce(
      (sum, log) => sum + (log.input_tokens || 0) + (log.output_tokens || 0),
      0
    ) || 0;

    // Calculate cost this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: monthlyUsage } = await supabase
      .from('ai_usage_logs')
      .select('cost_usd')
      .eq('user_id', userId)
      .eq('success', true)
      .gte('created_at', firstDayOfMonth.toISOString());

    const costThisMonth = monthlyUsage?.reduce((sum, log) => sum + Number(log.cost_usd), 0) || 0;

    // Calculate most used provider
    const providerCounts = usageStats?.reduce((acc, log) => {
      acc[log.provider] = (acc[log.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedProvider = providerCounts && Object.keys(providerCounts).length > 0
      ? Object.entries(providerCounts).sort(([,a], [,b]) => b - a)[0][0] as 'anthropic' | 'openai'
      : 'anthropic';

    // Calculate average cost per optimization
    const avgCostPerOptimization = totalOptimizations > 0
      ? totalCost / totalOptimizations
      : 0;

    return NextResponse.json({
      total_prompts: totalPrompts || 0,
      total_optimizations: totalOptimizations,
      total_cost: Number(totalCost.toFixed(4)),
      cost_this_month: Number(costThisMonth.toFixed(4)),
      most_used_provider: mostUsedProvider,
      total_tokens: totalTokens,
      avg_cost_per_optimization: Number(avgCostPerOptimization.toFixed(4)),
    });
  } catch (error) {
    console.error('[Analytics Overview] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
