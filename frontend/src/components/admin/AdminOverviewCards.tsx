'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
} from 'lucide-react';

interface OverviewData {
  total_users: number;
  total_requests: number;
  total_cost: number;
  cost_this_month: number;
  total_tokens: number;
  most_used_provider: string;
  avg_cost_per_request: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  requests_last_30_days: number;
  avg_latency_ms: number;
}

interface AdminOverviewCardsProps {
  data: OverviewData;
}

export function AdminOverviewCards({ data }: AdminOverviewCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: data.total_users.toLocaleString(),
      icon: Users,
      description: 'Active platform users',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Requests',
      value: data.total_requests.toLocaleString(),
      icon: Activity,
      description: 'All-time API requests',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Cost',
      value: `$${data.total_cost.toFixed(2)}`,
      icon: DollarSign,
      description: 'Lifetime platform spend',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'This Month',
      value: `$${data.cost_this_month.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Current month spend',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Success Rate',
      value: `${data.success_rate.toFixed(1)}%`,
      icon: CheckCircle,
      description: `${data.successful_requests.toLocaleString()} / ${data.total_requests.toLocaleString()} successful`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Failed Requests',
      value: data.failed_requests.toLocaleString(),
      icon: XCircle,
      description: 'Total failures',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Total Tokens',
      value: (data.total_tokens / 1000000).toFixed(2) + 'M',
      icon: Zap,
      description: 'All-time token usage',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Avg Latency',
      value: `${Math.round(data.avg_latency_ms)}ms`,
      icon: Clock,
      description: 'Average response time',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
