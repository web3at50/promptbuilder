import { NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  try {
    // Check if user is admin
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    // Get overall statistics for all users
    const { data: logs, error } = await supabase
      .from('ai_usage_logs')
      .select('*');

    if (error) {
      console.error('Error fetching admin overview:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    // Calculate statistics
    const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.cost_usd) || 0), 0);
    const totalTokens = logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
    const totalRequests = logs.length;
    const successfulRequests = logs.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;

    // Get unique users count
    const uniqueUsers = new Set(logs.map(log => log.user_id)).size;

    // Calculate current month cost
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const costThisMonth = logs
      .filter(log => new Date(log.created_at) >= firstDayOfMonth)
      .reduce((sum, log) => sum + (parseFloat(log.cost_usd) || 0), 0);

    // Get most used provider
    const providerCounts = logs.reduce((acc, log) => {
      acc[log.provider] = (acc[log.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedProvider = Object.entries(providerCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';

    // Calculate average cost per request
    const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Get daily request counts for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = logs.filter(log => new Date(log.created_at) >= thirtyDaysAgo).length;

    // Calculate average latency
    const totalLatency = logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0);
    const avgLatency = totalRequests > 0 ? totalLatency / totalRequests : 0;

    return NextResponse.json({
      total_users: uniqueUsers,
      total_requests: totalRequests,
      total_cost: totalCost,
      cost_this_month: costThisMonth,
      total_tokens: totalTokens,
      most_used_provider: mostUsedProvider,
      avg_cost_per_request: avgCostPerRequest,
      successful_requests: successfulRequests,
      failed_requests: failedRequests,
      success_rate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      requests_last_30_days: recentRequests,
      avg_latency_ms: avgLatency,
    });
  } catch (error) {
    console.error('Error in admin overview API:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
