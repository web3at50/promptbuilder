'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Prompt } from '@/types';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, Search, Wand2, Sparkles, Save, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        // Only fetch prompts if authenticated
        fetchPrompts();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setLoading(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      setPrompts(prompts.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite }),
      });

      if (!response.ok) throw new Error('Failed to update prompt');

      const updatedPrompt = await response.json();
      setPrompts(
        prompts.map((p) => (p.id === id ? updatedPrompt : p))
      );
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const favoritePrompts = filteredPrompts.filter((p) => p.favorite);
  const regularPrompts = filteredPrompts.filter((p) => !p.favorite);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show explainer page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header for unauthenticated users */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Prompt Library</h1>
                <p className="text-sm text-muted-foreground">
                  Create, optimise, and save your AI prompts
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="outline" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => router.push('/signup')}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Explainer Page Content */}
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Free to use with sign up</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Personal Prompt Library
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create, optimise, and organise your AI prompts in one place.
              Get better results from Claude, ChatGPT, and other language models.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/signup')} className="gap-2">
                <Plus className="h-5 w-5" />
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1: Create & Save */}
            <div className="flex flex-col p-8 border rounded-lg bg-card">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Save className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Create & Save</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build a library of your best prompts. Organize them with tags,
                mark favorites, and search through your collection instantly.
              </p>
            </div>

            {/* Feature 2: AI Optimization */}
            <div className="flex flex-col p-8 border rounded-lg bg-card">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Wand2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">AI Optimization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Improve your prompts with Claude or OpenAI. Get expert suggestions
                to make your prompts clearer, more effective, and better structured.
              </p>
            </div>

            {/* Feature 3: Multi-Model Support */}
            <div className="flex flex-col p-8 border rounded-lg bg-card">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Multi-Model Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimize with Claude and OpenAI, with support for more AI models
                coming soon. Choose the best model for your use case.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Sign up for free</h4>
                  <p className="text-muted-foreground">
                    Create your account in seconds. No credit card required.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Create your prompts</h4>
                  <p className="text-muted-foreground">
                    Write and save your prompts with titles, tags, and descriptions.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Optimize with AI</h4>
                  <p className="text-muted-foreground">
                    Use Claude or OpenAI to refine and improve your prompts for better results.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Build your library</h4>
                  <p className="text-muted-foreground">
                    Organize, search, and manage all your prompts in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-2xl mx-auto text-center p-8 border rounded-lg bg-card">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Sign up now and start building your prompt library. Completely free to use.
            </p>
            <Button size="lg" onClick={() => router.push('/signup')} className="gap-2">
              <Plus className="h-5 w-5" />
              Create Your Free Account
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Show library for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Prompt Library</h1>
              <p className="text-sm text-muted-foreground">
                Organise & optimise your AI prompts
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button onClick={() => router.push('/new')} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                New Prompt
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompts by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Prompts Grid */}
      <main className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading prompts...</p>
            </div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          searchQuery ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No prompts found</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Welcome to Prompt Library</h2>
                <p className="text-lg text-muted-foreground">
                  Save, organise, and optimise your AI prompts in one place
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Create a Prompt */}
                <div className="flex flex-col p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push('/new')}>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create a Prompt</h3>
                  <p className="text-muted-foreground mb-4 flex-1">
                    Start building your library by creating your first AI prompt
                  </p>
                  <Button className="w-full gap-2" onClick={(e) => { e.stopPropagation(); router.push('/new'); }}>
                    <Plus className="h-4 w-4" />
                    New Prompt
                  </Button>
                </div>

                {/* Optimize a Prompt */}
                <div className="flex flex-col p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push('/new')}>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Optimise a Prompt</h3>
                  <p className="text-muted-foreground mb-4 flex-1">
                    Use Claude or ChatGPT to improve and refine your prompts for better results
                  </p>
                  <Button variant="outline" className="w-full gap-2" onClick={(e) => { e.stopPropagation(); router.push('/new'); }}>
                    <Wand2 className="h-4 w-4" />
                    Get Started
                  </Button>
                </div>

                {/* Search Prompts */}
                <div className="flex flex-col p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors opacity-60">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Search Prompts</h3>
                  <p className="text-muted-foreground mb-4 flex-1">
                    Quickly find any prompt by searching title, content, or tags
                  </p>
                  <Button variant="outline" className="w-full gap-2" disabled>
                    <Search className="h-4 w-4" />
                    Create prompts first
                  </Button>
                </div>
              </div>

              <div className="mt-12 p-6 border rounded-lg bg-muted/30 text-center">
                <p className="text-muted-foreground">
                  💡 <strong>Tip:</strong> Create your first prompt, then use the optimise feature to enhance it with Claude or ChatGPT
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-12">
            {/* Favorites Section */}
            {favoritePrompts.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">★</span> Favorites
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoritePrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onEdit={(id) => router.push(`/edit/${id}`)}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Prompts Section */}
            {regularPrompts.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  {favoritePrompts.length > 0 ? 'All Prompts' : 'Your Prompts'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onEdit={(id) => router.push(`/edit/${id}`)}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
