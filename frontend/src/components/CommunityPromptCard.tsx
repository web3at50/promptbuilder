'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, GitFork, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPromptCardProps {
  prompt: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    category: string | null;
    tags: string[];
    like_count: number;
    fork_count: number;
    view_count: number;
    published_at: string;
    author_name: string | null;
    author_id: string;
    is_liked_by_user: boolean;
  };
  onView: (id: string) => void;
  onLike: (id: string, currentlyLiked: boolean) => void;
  onFork: (id: string) => void;
}

export function CommunityPromptCard({
  prompt,
  onView,
  onLike,
  onFork,
}: CommunityPromptCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-full cursor-pointer">
      <div onClick={() => onView(prompt.id)}>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl sm:text-xl leading-snug line-clamp-2">{prompt.title}</CardTitle>
            {prompt.category && (
              <Badge variant="outline" className="shrink-0 capitalize text-xs px-2.5 py-1">
                {prompt.category}
              </Badge>
            )}
          </div>

          {prompt.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {prompt.description}
            </p>
          )}

          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2.5 py-1">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
            {prompt.content}
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <User className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
            <span className="truncate">{prompt.author_name || 'Anonymous'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {formatDistanceToNow(new Date(prompt.published_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 sm:gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              <span>{prompt.like_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              <span>{prompt.fork_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              <span>{prompt.view_count}</span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Action Buttons */}
      <CardContent className="pt-0">
        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant={prompt.is_liked_by_user ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-2 min-h-[44px] sm:min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              onLike(prompt.id, prompt.is_liked_by_user);
            }}
          >
            <Heart
              className={`h-4 w-4 sm:h-3 sm:w-3 ${prompt.is_liked_by_user ? 'fill-current' : ''}`}
            />
            {prompt.is_liked_by_user ? 'Liked' : 'Like'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 min-h-[44px] sm:min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              onFork(prompt.id);
            }}
          >
            <GitFork className="h-4 w-4 sm:h-3 sm:w-3" />
            Fork
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
