'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Save, X, Star } from 'lucide-react';
import { Prompt } from '@/types';

export default function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [promptId, setPromptId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      const { id } = await params;
      setPromptId(id);
      fetchPrompt(id);
    };
    loadPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const fetchPrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch prompt');

      const prompt: Prompt = await response.json();
      setTitle(prompt.title);
      setContent(prompt.content);
      setTags(prompt.tags);
      setFavorite(prompt.favorite);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      alert('Failed to load prompt. Redirecting to library.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleToggleFavorite = async () => {
    if (!promptId) return;

    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: newFavoriteState }),
      });

      if (!response.ok) {
        // Revert on failure
        setFavorite(!newFavoriteState);
        throw new Error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !promptId) {
      alert('Please provide both a title and content for your prompt.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags, favorite }),
      });

      if (!response.ok) throw new Error('Failed to update prompt');

      router.push('/');
    } catch (error) {
      console.error('Error updating prompt:', error);
      alert('Failed to update prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>

            <div className="flex gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className="gap-2"
              >
                <Star
                  className={`h-4 w-4 ${favorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                />
                {favorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Give your prompt a descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags
              </label>
              <Input
                id="tags"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your prompt here... You can use markdown formatting!"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
