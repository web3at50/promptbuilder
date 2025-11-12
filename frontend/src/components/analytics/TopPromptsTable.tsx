'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';

interface TopPrompt {
  id: string;
  title: string;
  optimization_count: number;
  total_cost: number;
  total_tokens: number;
  last_optimized_at: string | null;
  favorite: boolean;
}

interface TopPromptsTableProps {
  mostOptimized: TopPrompt[];
  mostExpensive: TopPrompt[];
}

export function TopPromptsTable({ mostOptimized, mostExpensive }: TopPromptsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const PromptRow = ({ prompt }: { prompt: TopPrompt }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{prompt.title}</p>
          {prompt.favorite && (
            <Star className="h-3 w-3 fill-amber-500 text-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {prompt.optimization_count} optimization{prompt.optimization_count !== 1 ? 's' : ''} •{' '}
          {formatNumber(prompt.total_tokens)} tokens •{' '}
          {formatCurrency(prompt.total_cost)}
        </p>
      </div>
      <Link href={`/edit/${prompt.id}`}>
        <Button variant="ghost" size="sm" className="flex-shrink-0">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Most Optimized Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Most Optimized</CardTitle>
          <CardDescription>Prompts with the most optimization attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {mostOptimized.length > 0 ? (
            <div className="space-y-2">
              {mostOptimized.map((prompt) => (
                <PromptRow key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No optimizations yet. Start optimizing prompts to see them here!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Expensive Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Most Expensive</CardTitle>
          <CardDescription>Prompts with the highest cumulative costs</CardDescription>
        </CardHeader>
        <CardContent>
          {mostExpensive.length > 0 ? (
            <div className="space-y-2">
              {mostExpensive.map((prompt) => (
                <PromptRow key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No cost data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
