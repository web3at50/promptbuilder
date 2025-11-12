'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, TrendingDown, TrendingUp, Zap, DollarSign } from 'lucide-react';

interface InsightsCardProps {
  overview: {
    total_optimizations: number;
    total_cost: number;
    cost_this_month: number;
    most_used_provider: 'anthropic' | 'openai';
    avg_cost_per_optimization: number;
  };
  usage: {
    by_provider: {
      anthropic: { tokens: number; count: number };
      openai: { tokens: number; count: number };
    };
    avg_tokens_per_optimization: number;
  };
  spending: {
    totals: {
      anthropic: number;
      openai: number;
    };
  };
  prompts: {
    most_optimized: Array<{ optimization_count: number; title: string }>;
  };
}

export function InsightsCard({ overview, usage, spending, prompts }: InsightsCardProps) {
  const insights: Array<{
    icon: React.ElementType;
    text: string;
    type: 'success' | 'warning' | 'info';
  }> = [];

  // Calculate provider cost comparison
  if (spending.totals.anthropic > 0 && spending.totals.openai > 0) {
    const diff = spending.totals.anthropic - spending.totals.openai;
    const percentDiff = (Math.abs(diff) / Math.min(spending.totals.anthropic, spending.totals.openai)) * 100;

    if (percentDiff > 20) {
      const moreExpensive = diff > 0 ? 'Claude' : 'ChatGPT';
      const cheaper = diff > 0 ? 'ChatGPT' : 'Claude';
      insights.push({
        icon: DollarSign,
        text: `${moreExpensive} costs you ${percentDiff.toFixed(0)}% more than ${cheaper}. Consider using ${cheaper} for cost-sensitive tasks.`,
        type: 'info',
      });
    }
  }

  // Calculate token efficiency
  if (usage.by_provider.anthropic.count > 0 && usage.by_provider.openai.count > 0) {
    const claudeAvgTokens = usage.by_provider.anthropic.tokens / usage.by_provider.anthropic.count;
    const gptAvgTokens = usage.by_provider.openai.tokens / usage.by_provider.openai.count;
    const diff = claudeAvgTokens - gptAvgTokens;
    const percentDiff = (Math.abs(diff) / Math.min(claudeAvgTokens, gptAvgTokens)) * 100;

    if (percentDiff > 30) {
      const moreVerbose = diff > 0 ? 'Claude' : 'ChatGPT';
      const lessVerbose = diff > 0 ? 'ChatGPT' : 'Claude';
      insights.push({
        icon: Zap,
        text: `${moreVerbose} generates ${percentDiff.toFixed(0)}% more tokens than ${lessVerbose} on average. ${moreVerbose} provides more detailed responses.`,
        type: 'info',
      });
    }
  }

  // Monthly spending insights
  if (overview.cost_this_month > 0) {
    const avgCostPerDay = overview.cost_this_month / new Date().getDate();
    const projectedMonthly = avgCostPerDay * 30;

    if (projectedMonthly > overview.cost_this_month * 1.5) {
      insights.push({
        icon: TrendingUp,
        text: `Your spending is accelerating! Projected monthly cost: $${projectedMonthly.toFixed(2)} vs current $${overview.cost_this_month.toFixed(2)}.`,
        type: 'warning',
      });
    } else if (projectedMonthly < overview.cost_this_month * 0.7) {
      insights.push({
        icon: TrendingDown,
        text: `Great job! Your spending has decreased this month. Keep up the efficient prompt usage!`,
        type: 'success',
      });
    }
  }

  // Most optimized prompt insight
  if (prompts.most_optimized.length > 0) {
    const topPrompt = prompts.most_optimized[0];
    if (topPrompt.optimization_count >= 5) {
      insights.push({
        icon: Lightbulb,
        text: `Your most optimized prompt "${topPrompt.title}" has been refined ${topPrompt.optimization_count} times. Consider saving it as a template!`,
        type: 'info',
      });
    }
  }

  // Average cost insights
  if (overview.avg_cost_per_optimization > 0) {
    if (overview.avg_cost_per_optimization < 0.01) {
      insights.push({
        icon: DollarSign,
        text: `Excellent! Your average cost per optimization is only $${overview.avg_cost_per_optimization.toFixed(4)}. Very cost-efficient!`,
        type: 'success',
      });
    } else if (overview.avg_cost_per_optimization > 0.05) {
      insights.push({
        icon: DollarSign,
        text: `Average cost per optimization is $${overview.avg_cost_per_optimization.toFixed(4)}. Consider optimizing shorter prompts or using ChatGPT for simpler tasks.`,
        type: 'info',
      });
    }
  }

  // Token usage insights
  if (usage.avg_tokens_per_optimization > 10000) {
    insights.push({
      icon: Zap,
      text: `Your prompts are quite detailed! Average ${usage.avg_tokens_per_optimization.toLocaleString()} tokens per optimization.`,
      type: 'info',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Insights & Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered insights about your usage patterns and cost optimization opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, index) => {
            const Icon = insight.icon;
            const bgColor =
              insight.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/20'
                : insight.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/20'
                  : 'bg-blue-50 dark:bg-blue-950/20';
            const iconColor =
              insight.type === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : insight.type === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400';

            return (
              <Alert key={index} className={bgColor}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <AlertDescription className="ml-2">{insight.text}</AlertDescription>
              </Alert>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Keep optimizing prompts to unlock personalized insights!</p>
            <p className="text-sm mt-1">We'll analyze your usage patterns and provide recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
