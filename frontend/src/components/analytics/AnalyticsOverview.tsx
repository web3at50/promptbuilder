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
  const providerColor = data.most_used_provider === 'anthropic' ? 'text-orange' : 'text-blue';

  const stats = [
    {
      title: 'Total Prompts',
      value: formatNumber(data.total_prompts),
      icon: FileText,
      description: 'Prompts in your library',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Total Optimizations',
      value: formatNumber(data.total_optimizations),
      icon: Zap,
      description: 'AI optimizations performed',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(data.total_cost),
      icon: DollarSign,
      description: 'All-time API costs',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: 'This Month',
      value: formatCurrency(data.cost_this_month),
      icon: TrendingUp,
      description: 'Current month spending',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    },
    {
      title: 'Total Tokens',
      value: formatNumber(data.total_tokens),
      icon: Activity,
      description: 'Input + output tokens',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    },
    {
      title: 'Preferred AI',
      value: providerName,
      icon: Brain,
      description: 'Most frequently used',
      color: providerColor,
      bgColor: data.most_used_provider === 'anthropic'
        ? 'bg-orange/5 dark:bg-orange/10'
        : 'bg-blue/5 dark:bg-blue/10',
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
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
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
