'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Prompt Library</h1>
                <p className="text-sm text-muted-foreground">
                  Organize & optimize your AI prompts
                </p>
              </div>
            </div>

            <Button onClick={() => router.push('/new')} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Prompt
            </Button>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {searchQuery ? 'No prompts found' : 'No prompts yet'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first AI prompt'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/new')} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Prompt
              </Button>
            )}
          </div>
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
