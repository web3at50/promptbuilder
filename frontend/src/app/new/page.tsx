'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Save, X, Sparkles } from 'lucide-react';
import { DualOptimizeView } from '@/components/DualOptimizeView';
import { toast } from 'sonner';
import { VALIDATION_LIMITS } from '@/lib/validation';

export default function NewPromptPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [showDualOptimize, setShowDualOptimize] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmedTag = tagInput.trim();

      // Validate tag count
      if (tags.length >= VALIDATION_LIMITS.TAG_MAX_COUNT) {
        toast.error(`Maximum ${VALIDATION_LIMITS.TAG_MAX_COUNT} tags allowed`);
        return;
      }

      // Validate tag length
      if (trimmedTag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
        toast.error(`Tag must be ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters or less`);
        return;
      }

      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAutoSave = async (): Promise<string | undefined> => {
    // If already saved, return existing promptId
    if (promptId) return promptId;

    // Require title before auto-saving
    if (!title.trim() || !content.trim()) {
      alert('Please provide a title and content before optimizing.');
      return undefined;
    }

    console.log('[New Page] Auto-saving prompt before optimization...');

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        toast.error('Prompt Limit Reached', {
          description: errorData.message || 'You have reached the maximum of 10 prompts. Please contact support@syntorak.com to upgrade your account.',
          duration: 6000,
        });
        return undefined;
      }

      if (!response.ok) throw new Error('Failed to create prompt');

      const savedPrompt = await response.json();
      setPromptId(savedPrompt.id);
      console.log('[New Page] Auto-saved prompt with ID:', savedPrompt.id);

      return savedPrompt.id;
    } catch (error) {
      console.error('Error auto-saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
      return undefined;
    }
  };

  const handleCompareBoth = async () => {
    // Auto-save the prompt first if not already saved
    const savedPromptId = await handleAutoSave();
    if (savedPromptId) {
      setShowDualOptimize(true);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content for your prompt.');
      return;
    }

    setSaving(true);
    try {
      // If prompt was auto-saved during optimization, update it
      if (promptId) {
        const response = await fetch(`/api/prompts/${promptId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, tags }),
        });

        if (!response.ok) throw new Error('Failed to update prompt');
      } else {
        // Otherwise create a new prompt
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, tags }),
        });

        if (response.status === 429) {
          const errorData = await response.json();
          toast.error('Prompt Limit Reached', {
            description: errorData.message || 'You have reached the maximum of 10 prompts. Please contact support@syntorak.com to upgrade your account.',
            duration: 6000,
          });
          return;
        }

        if (!response.ok) throw new Error('Failed to create prompt');
      }

      router.push('/');
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2 min-h-[40px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Prompt'}
              </Button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="gap-2 min-h-[44px] px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Back</span>
              </Button>

              <ThemeToggle />
            </div>

            {/* Mobile Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="w-full gap-2 min-h-[44px]"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Prompt'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title ({title.length}/{VALIDATION_LIMITS.TITLE_MAX_LENGTH})
              </label>
              <Input
                id="title"
                placeholder="Give your prompt a descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={VALIDATION_LIMITS.TITLE_MAX_LENGTH}
                className="text-lg"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags ({tags.length}/{VALIDATION_LIMITS.TAG_MAX_COUNT})
              </label>
              <Input
                id="tags"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                maxLength={VALIDATION_LIMITS.TAG_MAX_LENGTH}
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
                promptId={promptId || undefined}
                onBeforeOptimize={handleAutoSave}
                hideOptimizeButtons={true}
              />
            </div>

            {/* AI Optimization Actions */}
            {content.trim() && (
              <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-green-50 dark:from-purple-950/20 dark:to-green-950/20 border-purple-200 dark:border-purple-800">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-1 text-sm sm:text-base">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      AI Optimization
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Optimize your prompt with Claude, ChatGPT, or compare both models in parallel
                    </p>
                  </div>

                  {/* Optimization Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      onClick={async () => {
                        const savedPromptId = await handleAutoSave();
                        if (!savedPromptId) return;
                        const response = await fetch('/api/optimize', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: content, promptId: savedPromptId }),
                        });
                        if (response.ok) {
                          const { optimizedPrompt } = await response.json();
                          setContent(optimizedPrompt);
                        }
                      }}
                      variant="outline"
                      className="gap-2 min-h-[44px] sm:min-h-[40px] bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-950/70 border-purple-200 dark:border-purple-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden xs:inline">Optimize with </span>Claude
                    </Button>
                    <Button
                      onClick={async () => {
                        const savedPromptId = await handleAutoSave();
                        if (!savedPromptId) return;
                        const response = await fetch('/api/optimize-openai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: content, promptId: savedPromptId }),
                        });
                        if (response.ok) {
                          const { optimizedPrompt } = await response.json();
                          setContent(optimizedPrompt);
                        }
                      }}
                      variant="outline"
                      className="gap-2 min-h-[44px] sm:min-h-[40px] bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-950/70 border-green-200 dark:border-green-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden xs:inline">Optimize with </span>ChatGPT
                    </Button>
                    <Button
                      onClick={handleCompareBoth}
                      className="gap-2 min-h-[44px] sm:min-h-[40px] bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                    >
                      <Sparkles className="h-4 w-4" />
                      Compare Both
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dual Optimize View */}
      {showDualOptimize && promptId && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <DualOptimizeView
              promptId={promptId}
              promptText={content}
              onComplete={(selectedContent) => {
                if (selectedContent) {
                  setContent(selectedContent);
                }
                setShowDualOptimize(false);
              }}
              onCancel={() => setShowDualOptimize(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
