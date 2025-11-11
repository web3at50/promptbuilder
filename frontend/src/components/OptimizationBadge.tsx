'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Hash, DollarSign, Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OptimizationBadgeProps {
  optimizationCount: number;
  optimizedWith?: string | null;
  lastOptimizedAt?: string | null;
  className?: string;
}

export function OptimizationBadge({
  optimizationCount,
  optimizedWith,
  lastOptimizedAt,
  className = '',
}: OptimizationBadgeProps) {
  if (optimizationCount === 0) {
    return null;
  }

  // Determine provider from model name
  const getProvider = (model: string | null) => {
    if (!model) return null;
    if (model.includes('claude')) return 'Claude';
    if (model.includes('gpt')) return 'ChatGPT';
    return 'AI';
  };

  const provider = getProvider(optimizedWith || null);
  const providerIcon = provider === 'Claude' ? '🧠' : provider === 'ChatGPT' ? '🤖' : '✨';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Optimization Count Badge */}
      <Badge variant="secondary" className="gap-1.5">
        <Sparkles className="h-3 w-3" />
        <span>Optimized {optimizationCount}x</span>
      </Badge>

      {/* Last Optimized With Badge */}
      {optimizedWith && provider && (
        <Badge
          variant="outline"
          className={`gap-1.5 ${
            provider === 'Claude'
              ? 'border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-300'
              : 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300'
          }`}
        >
          <span>{providerIcon}</span>
          <span>Last: {provider}</span>
        </Badge>
      )}

      {/* Last Optimized Time Badge */}
      {lastOptimizedAt && (
        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(lastOptimizedAt), {
              addSuffix: true,
            })}
          </span>
        </Badge>
      )}
    </div>
  );
}

interface DetailedOptimizationStatsProps {
  optimizationCount: number;
  optimizedWith?: string | null;
  lastOptimizedAt?: string | null;
  totalTokens?: number;
  totalCost?: number;
}

export function DetailedOptimizationStats({
  optimizationCount,
  optimizedWith,
  lastOptimizedAt,
  totalTokens,
  totalCost,
}: DetailedOptimizationStatsProps) {
  if (optimizationCount === 0) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground text-center">
          This prompt hasn&apos;t been optimized yet. Click the optimize buttons below to improve it with AI.
        </p>
      </div>
    );
  }

  const getProvider = (model: string | null) => {
    if (!model) return null;
    if (model.includes('claude')) return 'Claude';
    if (model.includes('gpt')) return 'ChatGPT';
    return 'AI';
  };

  const provider = getProvider(optimizedWith || null);

  return (
    <div className="p-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-lg border">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-sm">Optimization Summary</h4>
            <p className="text-xs text-muted-foreground">
              This prompt has been optimized {optimizationCount} time
              {optimizationCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Last Provider */}
            {provider && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Last Provider
                </p>
                <p className="text-sm font-medium">{provider}</p>
              </div>
            )}

            {/* Last Optimized */}
            {lastOptimizedAt && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last Optimized
                </p>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(lastOptimizedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}

            {/* Total Tokens (if available) */}
            {totalTokens !== undefined && totalTokens > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Total Tokens
                </p>
                <p className="text-sm font-medium">
                  {totalTokens.toLocaleString()}
                </p>
              </div>
            )}

            {/* Total Cost (if available) */}
            {totalCost !== undefined && totalCost > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Total Cost
                </p>
                <p className="text-sm font-medium">
                  ${totalCost.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
