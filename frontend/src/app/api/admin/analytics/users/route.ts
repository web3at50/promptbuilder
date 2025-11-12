import { NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  try {
    // Check if user is admin
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();

    // Get all logs
    const { data: logs, error } = await supabase
      .from('ai_usage_logs')
      .select('*');

    if (error) {
      console.error('Error fetching user analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch user analytics' }, { status: 500 });
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Calculate per-user statistics
    const userStats = logs.reduce((acc, log) => {
      const userId = log.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          total_requests: 0,
          total_cost: 0,
          total_tokens: 0,
          successful_requests: 0,
          failed_requests: 0,
          avg_latency: 0,
          providers: {} as Record<string, number>,
          last_activity: log.created_at,
        };
      }

      acc[userId].total_requests += 1;
      acc[userId].total_cost += parseFloat(log.cost_usd) || 0;
      acc[userId].total_tokens += log.total_tokens || 0;
      acc[userId].avg_latency += log.latency_ms || 0;

      if (log.success) {
        acc[userId].successful_requests += 1;
      } else {
        acc[userId].failed_requests += 1;
      }

      // Track provider usage
      acc[userId].providers[log.provider] = (acc[userId].providers[log.provider] || 0) + 1;

      // Update last activity
      if (new Date(log.created_at) > new Date(acc[userId].last_activity)) {
        acc[userId].last_activity = log.created_at;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate average latency and enrich with profile data
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const userStatsList = Object.values(userStats).map((stats: any) => {
      const profile = profileMap.get(stats.user_id);
      return {
        ...stats,
        avg_latency: stats.total_requests > 0 ? stats.avg_latency / stats.total_requests : 0,
        success_rate: stats.total_requests > 0 ? (stats.successful_requests / stats.total_requests) * 100 : 0,
        user: profile || { email: 'Unknown User' },
      };
    });

    // Sort by total cost descending
    userStatsList.sort((a, b) => b.total_cost - a.total_cost);

    return NextResponse.json({
      users: userStatsList,
      total_users: userStatsList.length,
    });
  } catch (error) {
    console.error('Error in admin users API:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
