'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface UsageData {
  date: string;
  total_tokens: number;
  anthropic_tokens: number;
  openai_tokens: number;
  total_requests: number;
  anthropic_requests: number;
  openai_requests: number;
}

export function AdminUsageChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [data, setData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics/usage?range=${timeRange}`);
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>Token consumption across all users by provider</CardDescription>
          </div>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No usage data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeRange === 'daily') {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } else if (timeRange === 'weekly') {
                    return `W ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  } else {
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                }}
              />
              <YAxis
                className="text-xs"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toLocaleString(), '']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  });
                }}
              />
              <Legend />
              <Bar
                dataKey="anthropic_tokens"
                name="Anthropic Tokens"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="openai_tokens"
                name="OpenAI Tokens"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
