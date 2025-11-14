'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Zap,
  FileText,
  Activity,
  Brain,
} from 'lucide-react';

interface AnalyticsOverviewProps {
  data: {
    total_prompts: number;
    total_optimizations: number;
    total_cost: number;
    cost_this_month: number;
    most_used_provider: 'anthropic' | 'openai';
    total_tokens: number;
    avg_cost_per_optimization: number;
  };
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const providerName = data.most_used_provider === 'anthropic' ? 'Claude' : 'ChatGPT';
  const providerAccent =
    data.most_used_provider === 'anthropic' ? 'var(--chart-1)' : 'var(--chart-2)';

  const mixWithCard = (accent: string, percent = 12) =>
    `color-mix(in oklch, var(--card) ${100 - percent}%, ${accent} ${percent}%)`;

  const stats = [
    {
      title: 'Total Prompts',
      value: formatNumber(data.total_prompts),
      icon: FileText,
      description: 'Prompts in your library',
      accent: 'var(--chart-3)',
    },
    {
      title: 'Total Optimizations',
      value: formatNumber(data.total_optimizations),
      icon: Zap,
      description: 'AI optimizations performed',
      accent: 'var(--chart-1)',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(data.total_cost),
      icon: DollarSign,
      description: 'All-time API costs',
      accent: 'var(--chart-2)',
    },
    {
      title: 'This Month',
      value: formatCurrency(data.cost_this_month),
      icon: TrendingUp,
      description: 'Current month spending',
      accent: 'var(--provider-both)',
    },
    {
      title: 'Total Tokens',
      value: formatNumber(data.total_tokens),
      icon: Activity,
      description: 'Input + output tokens',
      accent: 'var(--primary)',
    },
    {
      title: 'Preferred AI',
      value: providerName,
      icon: Brain,
      description: 'Most frequently used',
      accent: providerAccent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div
                className="p-2 rounded-lg"
                style={{ background: mixWithCard(stat.accent ?? 'var(--primary)') }}
              >
                <Icon className="h-4 w-4" style={{ color: stat.accent }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: stat.accent }}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.title === 'This Month' && data.avg_cost_per_optimization > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Avg: {formatCurrency(data.avg_cost_per_optimization)} per optimization
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
