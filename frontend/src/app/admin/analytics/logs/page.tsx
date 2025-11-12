'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Search, Filter } from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';

interface LogEntry {
  id: string;
  created_at: string;
  user_id: string;
  provider: string;
  model: string;
  operation_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: string;
  latency_ms: number;
  success: boolean;
  user: {
    email?: string;
    clerk_username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  } | null;
  prompt: {
    id: string;
    title: string;
    original_prompt: string;
  } | null;
}

interface AggregatedData {
  date: string;
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  unique_users: number;
  avg_latency: number;
}

interface GroupedDataItem {
  date: string;
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  users: Set<string>;
  total_latency: number;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics/logs?limit=1000');
      if (response.status === 403) {
        router.push('/');
        return;
      }
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getUserDisplayName = (user: LogEntry['user']) => {
    if (!user) return 'Unknown User';
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.clerk_username || user.email || 'Unknown User';
  };

  const getUserInitials = (user: LogEntry['user']) => {
    if (!user) return '??';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Filter logs based on search and provider
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserDisplayName(log.user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvider = providerFilter === 'all' || log.provider === providerFilter;

    return matchesSearch && matchesProvider;
  });

  // Aggregate data by day
  const aggregateByDay = (logs: LogEntry[]): AggregatedData[] => {
    const grouped = logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total_requests: 0,
          total_cost: 0,
          total_tokens: 0,
          users: new Set<string>(),
          total_latency: 0,
        };
      }
      acc[date].total_requests += 1;
      acc[date].total_cost += parseFloat(log.cost_usd);
      acc[date].total_tokens += log.total_tokens;
      acc[date].users.add(log.user_id);
      acc[date].total_latency += log.latency_ms;
      return acc;
    }, {} as Record<string, GroupedDataItem>);

    return (Object.values(grouped) as GroupedDataItem[])
      .map((g) => ({
        date: g.date,
        total_requests: g.total_requests,
        total_cost: g.total_cost,
        total_tokens: g.total_tokens,
        unique_users: g.users.size,
        avg_latency: g.total_latency / g.total_requests,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  // Aggregate data by week
  const aggregateByWeek = (logs: LogEntry[]): AggregatedData[] => {
    const grouped = logs.reduce((acc, log) => {
      const date = new Date(log.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!acc[weekKey]) {
        acc[weekKey] = {
          date: weekKey,
          total_requests: 0,
          total_cost: 0,
          total_tokens: 0,
          users: new Set<string>(),
          total_latency: 0,
        };
      }
      acc[weekKey].total_requests += 1;
      acc[weekKey].total_cost += parseFloat(log.cost_usd);
      acc[weekKey].total_tokens += log.total_tokens;
      acc[weekKey].users.add(log.user_id);
      acc[weekKey].total_latency += log.latency_ms;
      return acc;
    }, {} as Record<string, GroupedDataItem>);

    return (Object.values(grouped) as GroupedDataItem[])
      .map((g) => ({
        date: `Week of ${g.date}`,
        total_requests: g.total_requests,
        total_cost: g.total_cost,
        total_tokens: g.total_tokens,
        unique_users: g.users.size,
        avg_latency: g.total_latency / g.total_requests,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  // Aggregate data by month
  const aggregateByMonth = (logs: LogEntry[]): AggregatedData[] => {
    const grouped = logs.reduce((acc, log) => {
      const date = new Date(log.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          date: monthKey,
          total_requests: 0,
          total_cost: 0,
          total_tokens: 0,
          users: new Set<string>(),
          total_latency: 0,
        };
      }
      acc[monthKey].total_requests += 1;
      acc[monthKey].total_cost += parseFloat(log.cost_usd);
      acc[monthKey].total_tokens += log.total_tokens;
      acc[monthKey].users.add(log.user_id);
      acc[monthKey].total_latency += log.latency_ms;
      return acc;
    }, {} as Record<string, GroupedDataItem>);

    return (Object.values(grouped) as GroupedDataItem[])
      .map((g) => ({
        date: g.date,
        total_requests: g.total_requests,
        total_cost: g.total_cost,
        total_tokens: g.total_tokens,
        unique_users: g.users.size,
        avg_latency: g.total_latency / g.total_requests,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const dailyData = aggregateByDay(filteredLogs);
  const weeklyData = aggregateByWeek(filteredLogs);
  const monthlyData = aggregateByMonth(filteredLogs);

  const exportToCSV = () => {
    const headers = [
      'Date/Time',
      'User',
      'Email',
      'Provider',
      'Model',
      'Operation',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Cost (USD)',
      'Latency (ms)',
      'Success',
    ];

    const rows = filteredLogs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      getUserDisplayName(log.user),
      log.user?.email || '',
      log.provider,
      log.model,
      log.operation_type,
      log.input_tokens,
      log.output_tokens,
      log.total_tokens,
      log.cost_usd,
      log.latency_ms,
      log.success ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-logs-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <AdminNav />

      <div>
        <h1 className="text-4xl font-bold tracking-tight">Usage Logs</h1>
        <p className="text-muted-foreground mt-2">
          Detailed view of all LLM API requests across all users
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Platform Logs</CardTitle>
              <CardDescription>View and filter LLM usage logs for all users</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, model, or operation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="daily">Daily Totals</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Totals</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Totals</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Loading logs...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No logs found
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Latency</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 100).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={log.user?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(log.user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {getUserDisplayName(log.user)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {log.user?.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                log.provider === 'anthropic'
                                  ? 'border-purple-500 text-purple-500'
                                  : 'border-green-500 text-green-500'
                              }
                            >
                              {log.provider === 'anthropic' ? 'Claude' : 'ChatGPT'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {log.model.split('-').slice(0, 3).join('-')}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {log.total_tokens.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            ${parseFloat(log.cost_usd).toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {log.latency_ms}ms
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={log.success ? 'default' : 'destructive'}
                              className={
                                log.success
                                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                  : ''
                              }
                            >
                              {log.success ? 'Success' : 'Failed'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredLogs.length > 100 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing first 100 of {filteredLogs.length} logs
                </p>
              )}
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">Total Tokens</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Avg Latency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyData.map((data) => (
                      <TableRow key={data.date}>
                        <TableCell className="font-medium">{data.date}</TableCell>
                        <TableCell className="text-right">
                          {data.total_requests.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{data.unique_users}</TableCell>
                        <TableCell className="text-right">
                          {data.total_tokens.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${data.total_cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(data.avg_latency)}ms
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">Total Tokens</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Avg Latency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyData.map((data) => (
                      <TableRow key={data.date}>
                        <TableCell className="font-medium">{data.date}</TableCell>
                        <TableCell className="text-right">
                          {data.total_requests.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{data.unique_users}</TableCell>
                        <TableCell className="text-right">
                          {data.total_tokens.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${data.total_cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(data.avg_latency)}ms
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">Total Tokens</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Avg Latency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((data) => (
                      <TableRow key={data.date}>
                        <TableCell className="font-medium">{data.date}</TableCell>
                        <TableCell className="text-right">
                          {data.total_requests.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{data.unique_users}</TableCell>
                        <TableCell className="text-right">
                          {data.total_tokens.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${data.total_cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(data.avg_latency)}ms
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
