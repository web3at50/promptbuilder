'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DailyUsage {
  date: string;
  tokens: number;
  cost: number;
  count: number;
}

interface UsageChartProps {
  dailyUsage: DailyUsage[];
  byProvider: {
    anthropic: { tokens: number; input: number; output: number; count: number };
    openai: { tokens: number; input: number; output: number; count: number };
  };
  totalTokens: number;
  avgTokensPerOptimization: number;
}

export function UsageChart({
  dailyUsage,
  byProvider,
  totalTokens,
  avgTokensPerOptimization,
}: UsageChartProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare pie chart data
const pieData = [
  {
    name: 'Claude',
    value: byProvider.anthropic.tokens,
    color: 'var(--chart-1)',
  },
  {
    name: 'ChatGPT',
    value: byProvider.openai.tokens,
    color: 'var(--chart-2)',
  },
];

const COLORS = pieData.map((entry) => entry.color);

  return (
    <div className="space-y-4">
      {/* Area Chart - Token Usage Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage Over Time</CardTitle>
          <CardDescription>
            Daily token consumption • Total: {formatNumber(totalTokens)} tokens • Avg:{' '}
            {formatNumber(avgTokensPerOptimization)} per optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyUsage}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'tokens') return [formatNumber(value), 'Tokens'];
                    if (name === 'count') return [value, 'Optimizations'];
                    return [value, name];
                  }}
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No usage data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Token Distribution by Provider */}
      <Card>
        <CardHeader>
          <CardTitle>Token Distribution by Provider</CardTitle>
          <CardDescription>Breakdown of total token usage between AI providers</CardDescription>
        </CardHeader>
        <CardContent>
          {totalTokens > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-4 w-full">
                {/* Claude Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--chart-1)' }}
                    />
                    <span className="font-medium">Claude</span>
                  </div>
                  <div className="pl-5 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{formatNumber(byProvider.anthropic.tokens)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input:</span>
                      <span>{formatNumber(byProvider.anthropic.input)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Output:</span>
                      <span>{formatNumber(byProvider.anthropic.output)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Count:</span>
                      <span>{byProvider.anthropic.count}</span>
                    </div>
                  </div>
                </div>

                {/* ChatGPT Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--chart-2)' }}
                    />
                    <span className="font-medium">ChatGPT</span>
                  </div>
                  <div className="pl-5 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{formatNumber(byProvider.openai.tokens)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input:</span>
                      <span>{formatNumber(byProvider.openai.input)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Output:</span>
                      <span>{formatNumber(byProvider.openai.output)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Count:</span>
                      <span>{byProvider.openai.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No usage data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
