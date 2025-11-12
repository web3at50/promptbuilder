'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Loader2, Calendar, DollarSign, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface UsageLog {
  created_at: string;
  provider: 'anthropic' | 'openai';
  model: string;
  operation_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  success: boolean;
  prompts: { title?: string } | null;
}

interface AggregatedData {
  date: string;
  count: number;
  total_tokens: number;
  total_cost: number;
  anthropic_count: number;
  openai_count: number;
}

export default function UsageLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/analytics/export');
      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptbuilder-usage-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export usage logs. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Aggregate by day, week, month
  const aggregateByPeriod = (period: 'daily' | 'weekly' | 'monthly'): AggregatedData[] => {
    const aggregated: Record<string, AggregatedData> = {};

    logs.forEach((log) => {
      const date = new Date(log.created_at);
      let dateKey: string;

      if (period === 'monthly') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        dateKey = monday.toISOString().split('T')[0];
      } else {
        dateKey = date.toISOString().split('T')[0];
      }

      if (!aggregated[dateKey]) {
        aggregated[dateKey] = {
          date: dateKey,
          count: 0,
          total_tokens: 0,
          total_cost: 0,
          anthropic_count: 0,
          openai_count: 0,
        };
      }

      aggregated[dateKey].count += 1;
      aggregated[dateKey].total_tokens += log.total_tokens || 0;
      aggregated[dateKey].total_cost += Number(log.cost_usd) || 0;
      if (log.provider === 'anthropic') {
        aggregated[dateKey].anthropic_count += 1;
      } else {
        aggregated[dateKey].openai_count += 1;
      }
    });

    return Object.values(aggregated)
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading usage logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/profile/analytics')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">Usage Logs</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={exporting}
                className="gap-2"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export CSV
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logs">All Logs ({logs.length})</TabsTrigger>
            <TabsTrigger value="daily">Daily Totals</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Totals</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Totals</TabsTrigger>
          </TabsList>

          {/* All Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Usage Logs</CardTitle>
                <CardDescription>
                  Complete history of all AI API calls and optimizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Prompt</TableHead>
                            <TableHead className="text-right">Tokens</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Latency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs.map((log, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {formatDate(log.created_at)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={log.provider === 'anthropic' ? 'default' : 'secondary'}
                                  className={
                                    log.provider === 'anthropic'
                                      ? 'bg-purple-600 hover:bg-purple-700'
                                      : 'bg-green-600 hover:bg-green-700'
                                  }
                                >
                                  {log.provider === 'anthropic' ? 'Claude' : 'ChatGPT'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {log.model}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {log.prompts?.title || 'N/A'}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatNumber(log.total_tokens || 0)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCurrency(Number(log.cost_usd))}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {log.latency_ms ? `${formatNumber(log.latency_ms)}ms` : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No usage logs yet. Start optimizing prompts to see them here!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Totals Tab */}
          <TabsContent value="daily" className="mt-6">
            <AggregatedView
              data={aggregateByPeriod('daily')}
              period="Daily"
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          </TabsContent>

          {/* Weekly Totals Tab */}
          <TabsContent value="weekly" className="mt-6">
            <AggregatedView
              data={aggregateByPeriod('weekly')}
              period="Weekly"
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          </TabsContent>

          {/* Monthly Totals Tab */}
          <TabsContent value="monthly" className="mt-6">
            <AggregatedView
              data={aggregateByPeriod('monthly')}
              period="Monthly"
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AggregatedView({
  data,
  period,
  formatCurrency,
  formatNumber,
}: {
  data: AggregatedData[];
  period: string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {period} Aggregated Totals
        </CardTitle>
        <CardDescription>
          Summarized usage statistics by {period.toLowerCase()} period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Total Calls</TableHead>
                  <TableHead className="text-right">Claude</TableHead>
                  <TableHead className="text-right">ChatGPT</TableHead>
                  <TableHead className="text-right">Total Tokens</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="text-purple-600 dark:text-purple-400">
                        {item.anthropic_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="text-green-600 dark:text-green-400">
                        {item.openai_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        {formatNumber(item.total_tokens)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(item.total_cost)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
