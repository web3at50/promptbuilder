'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  ArrowLeft,
  Heart,
  GitFork,
  Eye,
  User,
  Calendar,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPromptDetail {
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
  is_forked_by_user: boolean;
}

export default function CommunityPromptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoaded, user } = useUser();
  const [prompt, setPrompt] = useState<CommunityPromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPrompt();
    }
  }, [params.id]);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/prompts/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch prompt');

      const data = await response.json();
      setPrompt(data);
    } catch (error) {
      console.error('Error fetching prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like prompts');
      router.push('/login');
      return;
    }

    if (!prompt) return;

    try {
      const response = await fetch(`/api/community/prompts/${prompt.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle like');

      const data = await response.json();

      setPrompt({
        ...prompt,
        is_liked_by_user: data.liked,
        like_count: data.like_count,
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  const handleFork = async () => {
    if (!user) {
      alert('Please sign in to fork prompts');
      router.push('/login');
      return;
    }

    if (!prompt) return;

    try {
      const response = await fetch(`/api/community/prompts/${prompt.id}/fork`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to fork prompt');

      const data = await response.json();

      if (data.already_forked) {
        // Navigate to existing forked prompt
        router.push(`/edit/${data.prompt_id}`);
        return;
      }

      // Update fork count
      setPrompt({
        ...prompt,
        fork_count: data.fork_count,
        is_forked_by_user: true,
      });

      // Navigate to the new forked prompt
      router.push(`/edit/${data.prompt_id}`);
    } catch (error) {
      console.error('Error forking prompt:', error);
      alert('Failed to fork prompt. Please try again.');
    }
  };

  const handleCopyContent = () => {
    if (!prompt) return;

    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={() => router.push('/community')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold mb-2">Prompt not found</h2>
          <p className="text-muted-foreground mb-6">
            This prompt may have been removed or does not exist.
          </p>
          <Button onClick={() => router.push('/community')}>Go to Community</Button>
        </div>
      </div>
    );
  }

  const isOwnPrompt = user && prompt.author_id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => router.push('/community')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              {!user && isLoaded && (
                <>
                  <Button variant="outline" onClick={() => router.push('/login')} className="hidden sm:flex">
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/signup')}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-3xl mb-2">{prompt.title}</CardTitle>
                {prompt.description && (
                  <CardDescription className="text-base">
                    {prompt.description}
                  </CardDescription>
                )}
              </div>
              {prompt.category && (
                <Badge variant="outline" className="capitalize">
                  {prompt.category}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{prompt.author_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Published{' '}
                  {formatDistanceToNow(new Date(prompt.published_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 text-sm pt-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>
                  {prompt.like_count} {prompt.like_count === 1 ? 'like' : 'likes'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-muted-foreground" />
                <span>
                  {prompt.fork_count} {prompt.fork_count === 1 ? 'fork' : 'forks'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>
                  {prompt.view_count} {prompt.view_count === 1 ? 'view' : 'views'}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Prompt Content */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Prompt Content</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContent}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border whitespace-pre-wrap font-mono text-sm">
                {prompt.content}
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnPrompt && (
              <div className="flex gap-3 pt-4">
                <Button
                  variant={prompt.is_liked_by_user ? 'default' : 'outline'}
                  onClick={handleLike}
                  className="flex-1 gap-2"
                >
                  <Heart
                    className={`h-4 w-4 ${prompt.is_liked_by_user ? 'fill-current' : ''}`}
                  />
                  {prompt.is_liked_by_user ? 'Unlike' : 'Like'}
                </Button>
                <Button onClick={handleFork} className="flex-1 gap-2">
                  <GitFork className="h-4 w-4" />
                  {prompt.is_forked_by_user ? 'Fork Again' : 'Fork to Library'}
                </Button>
              </div>
            )}

            {isOwnPrompt && (
              <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
                This is your published prompt
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
