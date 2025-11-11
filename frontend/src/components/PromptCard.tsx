'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Prompt } from '@/types';
import { Pencil, Trash2, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OptimizationBadge } from '@/components/OptimizationBadge';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onToggleFavorite,
}: PromptCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
      {prompt.favorite && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center transform rotate-12">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
        </div>
      )}

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2">{prompt.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onToggleFavorite(prompt.id, !prompt.favorite)}
          >
            <Star
              className={`h-4 w-4 ${prompt.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
            />
          </Button>
        </div>

        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Optimization Badge */}
        {prompt.optimization_count > 0 && (
          <OptimizationBadge
            optimizationCount={prompt.optimization_count}
            optimizedWith={prompt.optimized_with}
            lastOptimizedAt={prompt.last_optimized_at}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {prompt.content}
        </p>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(prompt.created_at), {
              addSuffix: true,
            })}
          </span>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(prompt.id)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(prompt.id)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
