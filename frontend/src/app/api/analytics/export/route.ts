import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

// GET /api/analytics/export
// Exports all usage logs as CSV
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClient();

    // Fetch all usage logs with prompt information
    const { data: usageLogs, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) throw error;

    // CSV headers
    const headers = [
      'Date',
      'Time',
      'Provider',
      'Model',
      'Operation',
      'Prompt Title',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Cost (USD)',
      'Latency (ms)',
      'Success',
      'Error',
    ];

    // Convert to CSV rows
    const rows = usageLogs?.map((log) => {
      const date = new Date(log.created_at);
      const prompts = log.prompts as { title?: string } | null;
      const promptTitle = prompts?.title || 'N/A';

      return [
        date.toLocaleDateString('en-US'),
        date.toLocaleTimeString('en-US'),
        log.provider === 'anthropic' ? 'Claude' : 'ChatGPT',
        log.model,
        log.operation_type,
        `"${promptTitle.replace(/"/g, '""')}"`, // Escape quotes in CSV
        log.input_tokens || 0,
        log.output_tokens || 0,
        log.total_tokens || 0,
        log.cost_usd || 0,
        log.latency_ms || 0,
        log.success ? 'Yes' : 'No',
        log.error_message ? `"${log.error_message.replace(/"/g, '""')}"` : '',
      ].join(',');
    }) || [];

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Return as downloadable CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="promptbuilder-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[Analytics Export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
