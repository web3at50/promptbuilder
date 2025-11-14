'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type TimeRange = 'daily' | 'weekly' | 'monthly';

interface SpendingData {
  date: string;
  total_cost: number;
  anthropic_cost: number;
  openai_cost: number;
  total_requests: number;
  total_tokens: number;
}

export function AdminSpendingChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [data, setData] = useState<SpendingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics/spending?range=${timeRange}`);
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error('Error fetching spending data:', error);
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
            <CardTitle>Platform Spending</CardTitle>
            <CardDescription>Total costs across all users and providers</CardDescription>
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
            No spending data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="anthropic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="openai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeRange === 'daily') {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } else if (timeRange === 'weekly') {
                    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  } else {
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  }
                }}
              />
              <YAxis
                className="text-xs"
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, '']}
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
              <Area
                type="monotone"
                dataKey="anthropic_cost"
                name="Anthropic"
                stroke="var(--chart-1)"
                fill="url(#anthropic)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="openai_cost"
                name="OpenAI"
                stroke="var(--chart-2)"
                fill="url(#openai)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
