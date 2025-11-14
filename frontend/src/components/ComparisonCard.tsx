'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Hash, DollarSign, Zap, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ComparisonCardProps {
  provider: 'claude' | 'openai';
  output: string | null;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  latency_ms: number;
  isLoading: boolean;
  error: string | null;
  onSelect: () => void;
  onDiscard: () => void;
  isSelected: boolean;
  isDiscarded: boolean;
}

export function ComparisonCard({
  provider,
  output,
  tokens_input,
  tokens_output,
  cost_usd,
  latency_ms,
  isLoading,
  error,
  onSelect,
  onDiscard,
  isSelected,
  isDiscarded,
}: ComparisonCardProps) {
  const getProviderInfo = () => {
    if (provider === 'claude') {
      return {
        name: 'Claude Sonnet 4.5',
        emoji: '🧠',
        color: 'border-orange bg-orange/5',
        textColor: 'text-orange',
        buttonColor: 'bg-orange hover:bg-orange/90 text-orange-foreground',
      };
    }
    return {
      name: 'GPT-4o',
      emoji: '🤖',
      color: 'border-blue bg-blue/5',
      textColor: 'text-blue',
      buttonColor: 'bg-blue hover:bg-blue/90 text-blue-foreground',
    };
  };

  const providerInfo = getProviderInfo();

  return (
    <Card className={`p-6 ${providerInfo.color} border-2 relative`}>
      {/* Selected/Discarded Overlay */}
      {(isSelected || isDiscarded) && (
        <div
          className={`absolute inset-0 ${
            isSelected ? 'bg-orange/10' : 'bg-muted/50'
          } rounded-lg flex items-center justify-center z-10`}
        >
          <div
            className={`text-6xl ${
              isSelected ? 'text-orange' : 'text-muted-foreground'
            }`}
          >
            {isSelected ? '✅' : '❌'}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{providerInfo.emoji}</div>
          <div>
            <h3 className={`font-bold text-lg ${providerInfo.textColor}`}>
              {providerInfo.name}
            </h3>
            <p className="text-xs text-muted-foreground">AI Optimization</p>
          </div>
        </div>
        {isLoading && (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Optimizing...
          </Badge>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Optimizing with {providerInfo.name}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="py-8 px-4 bg-destructive/10 border border-destructive/50 rounded-lg">
          <div className="flex items-center gap-2 text-destructive font-medium mb-1">
            <X className="h-4 w-4" />
            Optimization Failed
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Success State */}
      {output && !isLoading && !error && (
        <>
          {/* Output Preview */}
          <div className="mb-4">
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-background/50 rounded-lg border max-h-96 overflow-y-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {output}
              </ReactMarkdown>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Hash className="h-3 w-3" />
                Input
              </p>
              <p className="text-sm font-medium">{tokens_input.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Hash className="h-3 w-3" />
                Output
              </p>
              <p className="text-sm font-medium">{tokens_output.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <DollarSign className="h-3 w-3" />
                Cost
              </p>
              <p className="text-sm font-medium">${cost_usd.toFixed(4)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                Speed
              </p>
              <p className="text-sm font-medium">{(latency_ms / 1000).toFixed(1)}s</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onSelect}
              disabled={isSelected || isDiscarded}
              className={`flex-1 gap-2 ${providerInfo.buttonColor}`}
            >
              <Check className="h-4 w-4" />
              {isSelected ? 'Selected' : 'Use This Version'}
            </Button>
            <Button
              onClick={onDiscard}
              disabled={isSelected || isDiscarded}
              variant="outline"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {isDiscarded ? 'Discarded' : 'Discard'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
