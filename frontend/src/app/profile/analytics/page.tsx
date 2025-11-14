'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, List } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { SpendingChart } from '@/components/analytics/SpendingChart';
import { UsageChart } from '@/components/analytics/UsageChart';
import { TopPromptsTable } from '@/components/analytics/TopPromptsTable';
import { InsightsCard } from '@/components/analytics/InsightsCard';

interface OverviewData {
  total_prompts: number;
  total_optimizations: number;
  total_cost: number;
  cost_this_month: number;
  most_used_provider: 'anthropic' | 'openai';
  total_tokens: number;
  avg_cost_per_optimization: number;
}

interface SpendingData {
  period: string;
  data: Array<{
    date: string;
    anthropic: number;
    openai: number;
    total: number;
  }>;
  totals: {
    anthropic: number;
    openai: number;
    total: number;
  };
}

interface UsageData {
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  by_provider: {
    anthropic: { tokens: number; input: number; output: number; count: number };
    openai: { tokens: number; input: number; output: number; count: number };
  };
  avg_tokens_per_optimization: number;
  daily_usage: Array<{
    date: string;
    tokens: number;
    cost: number;
    count: number;
  }>;
}

interface PromptsData {
  most_optimized: Array<{
    id: string;
    title: string;
    optimization_count: number;
    total_cost: number;
    total_tokens: number;
    last_optimized_at: string | null;
    favorite: boolean;
  }>;
  most_expensive: Array<{
    id: string;
    title: string;
    optimization_count: number;
    total_cost: number;
    total_tokens: number;
    last_optimized_at: string | null;
    favorite: boolean;
  }>;
  favorites: {
    count: number;
    total_optimizations: number;
    total_cost: number;
  };
  total_prompts_with_optimizations: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [spending, setSpending] = useState<SpendingData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [prompts, setPrompts] = useState<PromptsData | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, spendingRes, usageRes, promptsRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/spending?period=daily'),
        fetch('/api/analytics/usage'),
        fetch('/api/analytics/prompts'),
      ]);

      const [overviewData, spendingData, usageData, promptsData] = await Promise.all([
        overviewRes.json(),
        spendingRes.json(),
        usageRes.json(),
        promptsRes.json(),
      ]);

      setOverview(overviewData);
      setSpending(spendingData);
      setUsage(usageData);
      setPrompts(promptsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all usage logs
      const response = await fetch('/api/analytics/export');

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptbuilder-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export analytics. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!overview || !spending || !usage || !prompts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive">Failed to load analytics</p>
          <Button onClick={fetchAllAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="gap-2 shrink-0 min-h-[44px] sm:min-h-[40px]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Back to Library</span>
                <span className="xs:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <h1 className="text-lg sm:text-xl font-bold truncate">Analytics Dashboard</h1>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="default"
                onClick={() => router.push('/profile/analytics/logs')}
                className="gap-2 flex-1 sm:flex-initial min-h-[44px] sm:min-h-[40px]"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">View Logs</span>
                <span className="sm:hidden">Logs</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={exporting}
                className="gap-2 flex-1 sm:flex-initial min-h-[44px] sm:min-h-[40px]"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6 max-w-7xl">
        {/* Overview Cards */}
        <AnalyticsOverview data={overview} />

        {/* Insights */}
        <InsightsCard overview={overview} usage={usage} spending={spending} prompts={prompts} />

        {/* Spending Charts */}
        <SpendingChart
          data={spending.data}
          totals={spending.totals}
          period={spending.period as 'daily' | 'weekly' | 'monthly'}
        />

        {/* Usage Charts */}
        <UsageChart
          dailyUsage={usage.daily_usage}
          byProvider={usage.by_provider}
          totalTokens={usage.total_tokens}
          avgTokensPerOptimization={usage.avg_tokens_per_optimization}
        />

        {/* Top Prompts Tables */}
        <TopPromptsTable
          mostOptimized={prompts.most_optimized}
          mostExpensive={prompts.most_expensive}
        />
      </main>
    </div>
  );
}
