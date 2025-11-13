'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CommunityPromptCard } from '@/components/CommunityPromptCard';
import { Search, Filter, TrendingUp, Clock, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VALIDATION_LIMITS } from '@/lib/validation';

interface CommunityPrompt {
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
}

export default function CommunityPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const fetchCommunityPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sort', sortBy);

      const response = await fetch(`/api/community/prompts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch prompts');

      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching community prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, searchQuery]);

  useEffect(() => {
    fetchCommunityPrompts();
  }, [fetchCommunityPrompts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommunityPrompts();
  };

  const handleLike = async (id: string) => {
    if (!user) {
      toast.info('Please sign in to like prompts', {
        description: 'Create an account or sign in to interact with community prompts',
      });
      return;
    }

    try {
      const response = await fetch(`/api/community/prompts/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle like');

      const data = await response.json();

      // Update the prompts list
      setPrompts(
        prompts.map((p) =>
          p.id === id
            ? {
                ...p,
                is_liked_by_user: data.liked,
                like_count: data.like_count,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleFork = async (id: string) => {
    if (!user) {
      toast.info('Please sign in to fork prompts', {
        description: 'Create an account or sign in to add prompts to your library',
      });
      return;
    }

    try {
      const response = await fetch(`/api/community/prompts/${id}/fork`, {
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
      setPrompts(
        prompts.map((p) =>
          p.id === id ? { ...p, fork_count: data.fork_count } : p
        )
      );

      // Show success message and navigate
      toast.success('Prompt forked successfully!');
      router.push(`/edit/${data.prompt_id}`);
    } catch (error) {
      console.error('Error forking prompt:', error);
      toast.error('Failed to fork prompt. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Community Prompts</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Discover and fork prompts from the community
                </p>
              </div>
            </div>

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

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search community prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={VALIDATION_LIMITS.SEARCH_MAX_LENGTH}
            className="pl-10 h-12 text-base"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Most Recent
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Most Liked
                </div>
              </SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prompts Grid */}
      <main className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading community prompts...</p>
            </div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No prompts found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || category !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to share a prompt with the community!'}
            </p>
            <Button onClick={() => router.push('/')}>Go to Library</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Found {prompts.length} prompt{prompts.length === 1 ? '' : 's'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <CommunityPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onView={(id) => router.push(`/community/${id}`)}
                  onLike={handleLike}
                  onFork={handleFork}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
