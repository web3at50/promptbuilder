import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/analytics/prompts
// Returns analytics about the most optimized and most expensive prompts
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    // Get all prompts with their optimization stats
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, title, optimization_count, last_optimized_at, favorite')
      .eq('user_id', userId)
      .order('optimization_count', { ascending: false });

    if (promptsError) throw promptsError;

    // Get usage logs grouped by prompt
    const { data: usageLogs, error: usageError } = await supabase
      .from('ai_usage_logs')
      .select('prompt_id, cost_usd, input_tokens, output_tokens')
      .eq('user_id', userId)
      .eq('success', true)
      .not('prompt_id', 'is', null);

    if (usageError) throw usageError;

    // Aggregate usage by prompt
    const usageByPrompt = usageLogs?.reduce((acc, log) => {
      const promptId = log.prompt_id!;
      if (!acc[promptId]) {
        acc[promptId] = {
          total_cost: 0,
          total_tokens: 0,
          count: 0,
        };
      }

      acc[promptId].total_cost += Number(log.cost_usd);
      acc[promptId].total_tokens += (log.input_tokens || 0) + (log.output_tokens || 0);
      acc[promptId].count += 1;

      return acc;
    }, {} as Record<string, { total_cost: number; total_tokens: number; count: number }>);

    // Combine prompts with their usage stats
    const promptsWithStats = prompts?.map((prompt) => {
      const usage = usageByPrompt?.[prompt.id] || { total_cost: 0, total_tokens: 0, count: 0 };

      return {
        id: prompt.id,
        title: prompt.title,
        optimization_count: prompt.optimization_count || 0,
        total_cost: Number(usage.total_cost.toFixed(4)),
        total_tokens: usage.total_tokens,
        last_optimized_at: prompt.last_optimized_at,
        favorite: prompt.favorite,
      };
    }) || [];

    // Get top 10 most optimized
    const mostOptimized = [...promptsWithStats]
      .filter((p) => p.optimization_count > 0)
      .sort((a, b) => b.optimization_count - a.optimization_count)
      .slice(0, 10);

    // Get top 10 most expensive
    const mostExpensive = [...promptsWithStats]
      .filter((p) => p.total_cost > 0)
      .sort((a, b) => b.total_cost - a.total_cost)
      .slice(0, 10);

    // Get favorite prompts stats
    const favoritePrompts = promptsWithStats.filter((p) => p.favorite);
    const favoritesStats = {
      count: favoritePrompts.length,
      total_optimizations: favoritePrompts.reduce((sum, p) => sum + p.optimization_count, 0),
      total_cost: Number(
        favoritePrompts.reduce((sum, p) => sum + p.total_cost, 0).toFixed(4)
      ),
    };

    return NextResponse.json({
      most_optimized: mostOptimized,
      most_expensive: mostExpensive,
      favorites: favoritesStats,
      total_prompts_with_optimizations: promptsWithStats.filter((p) => p.optimization_count > 0)
        .length,
    });
  } catch (error) {
    console.error('[Analytics Prompts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts analytics' },
      { status: 500 }
    );
  }
}
