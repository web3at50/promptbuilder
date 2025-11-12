import { NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';
import { requireAdmin } from '@/lib/admin';

export async function GET(request: Request) {
  try {
    // Check if user is admin
    await requireAdmin();

    const supabase = await createClerkSupabaseClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('user_id');
    const provider = searchParams.get('provider');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    let query = supabase
      .from('ai_usage_logs')
      .select(`
        *,
        prompts:prompt_id (
          id,
          title,
          original_prompt
        ),
        profiles:user_id (
          id,
          email,
          clerk_username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (provider) {
      query = query.eq('provider', provider);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error, count } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching admin logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Fetch user profiles separately to enrich the logs
    const userIds = [...new Set(logs.map(log => log.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // Fetch prompts separately
    const promptIds = logs
      .map(log => log.prompt_id)
      .filter((id): id is string => id !== null);
    const { data: prompts } = await supabase
      .from('prompts')
      .select('id, title, original_prompt')
      .in('id', promptIds);

    // Create lookup maps
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const promptMap = new Map(prompts?.map(p => [p.id, p]) || []);

    // Enrich logs with user and prompt data
    const enrichedLogs = logs.map(log => ({
      ...log,
      user: profileMap.get(log.user_id) || null,
      prompt: log.prompt_id ? promptMap.get(log.prompt_id) || null : null,
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in admin logs API:', error);
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
