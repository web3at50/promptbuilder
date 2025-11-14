'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SpendingData {
  date: string;
  anthropic: number;
  openai: number;
  total: number;
}

interface SpendingChartProps {
  data: SpendingData[];
  totals: {
    anthropic: number;
    openai: number;
    total: number;
  };
  period: 'daily' | 'weekly' | 'monthly';
}

export function SpendingChart({ data, totals, period }: SpendingChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'monthly') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (period === 'weekly') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Prepare data for the bar chart (provider comparison)
  const providerComparisonData = [
    {
      name: 'Claude',
      cost: totals.anthropic,
      color: 'var(--chart-1)',
    },
    {
      name: 'ChatGPT',
      cost: totals.openai,
      color: 'var(--chart-2)',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Line Chart - Spending Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
          <CardDescription>
            Daily costs for the last 30 days • Total: {formatCurrency(totals.total)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="anthropic"
                  stroke="var(--chart-1)"
                  name="Claude"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="openai"
                  stroke="var(--chart-2)"
                  name="ChatGPT"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--provider-both)"
                  name="Total"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No spending data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Provider Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Provider</CardTitle>
          <CardDescription>Total spending comparison between Claude and ChatGPT</CardDescription>
        </CardHeader>
        <CardContent>
          {totals.total > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={providerComparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                  {providerComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No spending data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
