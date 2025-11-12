'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PromptOptimization } from '@/types';
import { Eye, RotateCcw, Hash, DollarSign, Zap, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface VersionCardProps {
  optimization: PromptOptimization;
  isLatest: boolean;
  onRestore: (versionId: string) => void;
  isRestoring: boolean;
}

export function VersionCard({
  optimization,
  isLatest,
  onRestore,
  isRestoring,
}: VersionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProviderInfo = (provider: string) => {
    if (provider === 'anthropic') {
      return {
        name: 'Claude',
        emoji: '🧠',
        color: 'border-purple-500/50 bg-purple-500/10',
        textColor: 'text-purple-700 dark:text-purple-300',
      };
    }
    return {
      name: 'ChatGPT',
      emoji: '🤖',
      color: 'border-green-500/50 bg-green-500/10',
      textColor: 'text-green-700 dark:text-green-300',
    };
  };

  const provider = getProviderInfo(optimization.provider);

  // Calculate preview length
  const previewLength = 150;
  const isLong = optimization.output_text.length > previewLength;
  const displayText = isExpanded
    ? optimization.output_text
    : optimization.output_text.substring(0, previewLength) + (isLong ? '...' : '');

  return (
    <Card className={`p-4 ${provider.color} border-2 relative`}>
      {/* Latest Badge */}
      {isLatest && (
        <div className="absolute top-2 right-2">
          <Badge variant="default" className="bg-primary">
            ⭐ Current
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">{provider.emoji}</div>
        <div className="flex-1">
          <h4 className={`font-semibold text-lg ${provider.textColor}`}>
            Version {optimization.version} - {provider.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(optimization.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      {/* Model Info */}
      <div className="mb-3">
        <Badge variant="outline" className="text-xs">
          <Brain className="h-3 w-3 mr-1" />
          {optimization.model}
        </Badge>
      </div>

      {/* Output Preview */}
      <div className="mb-3">
        <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-background/50 rounded border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayText}
          </ReactMarkdown>
        </div>
        {isLong && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show More
              </>
            )}
          </Button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 p-3 bg-muted/30 rounded">
        {optimization.tokens_input !== null && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Hash className="h-3 w-3" />
              Input
            </p>
            <p className="text-sm font-medium">
              {optimization.tokens_input.toLocaleString()}
            </p>
          </div>
        )}
        {optimization.tokens_output !== null && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Hash className="h-3 w-3" />
              Output
            </p>
            <p className="text-sm font-medium">
              {optimization.tokens_output.toLocaleString()}
            </p>
          </div>
        )}
        {optimization.cost_usd !== null && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              Cost
            </p>
            <p className="text-sm font-medium">
              ${optimization.cost_usd.toFixed(4)}
            </p>
          </div>
        )}
        {optimization.latency_ms !== null && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="h-3 w-3" />
              Speed
            </p>
            <p className="text-sm font-medium">
              {(optimization.latency_ms / 1000).toFixed(1)}s
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Eye className="h-3 w-3" />
          {isExpanded ? 'Collapse' : 'View Full'}
        </Button>
        {!isLatest && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onRestore(optimization.id)}
            disabled={isRestoring}
            className="gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            {isRestoring ? 'Restoring...' : 'Restore This Version'}
          </Button>
        )}
      </div>
    </Card>
  );
}
