'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, X, Star, Eye, GitCompare, History, FileEdit, Sparkles, Globe, XCircle } from 'lucide-react';
import { Prompt } from '@/types';
import { OriginalPromptModal } from '@/components/OriginalPromptModal';
import { BeforeAfterModal } from '@/components/BeforeAfterModal';
import { DetailedOptimizationStats } from '@/components/OptimizationBadge';
import { VersionHistory } from '@/components/VersionHistory';
import { DualOptimizeView } from '@/components/DualOptimizeView';
import { PublishPromptModal } from '@/components/PublishPromptModal';
import { VALIDATION_LIMITS } from '@/lib/validation';
import { toast } from 'sonner';

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

  // Optimization tracking fields
  const [promptData, setPromptData] = useState<Prompt | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDualOptimize, setShowDualOptimize] = useState(false);

  // Publishing fields
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    const loadPrompt = async () => {
      const { id } = await params;
      console.log('[Edit Page] Extracted promptId from URL params:', id);
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
      setPromptData(prompt);
      setTitle(prompt.title);
      setContent(prompt.content);
      setTags(prompt.tags);
      setFavorite(prompt.favorite);
      setIsPublic(prompt.is_public || false);
      setShareToken(prompt.share_token || null);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      alert('Failed to load prompt. Redirecting to library.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (promptData?.original_prompt) {
      setContent(promptData.original_prompt);
    }
  };

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

  const handlePublishSuccess = (newShareToken: string, publicUrl: string) => {
    setIsPublic(true);
    setShareToken(newShareToken);
    alert(`Prompt published successfully! View it at: ${window.location.origin}${publicUrl}`);
  };

  const handleUnpublish = async () => {
    if (!promptId) return;

    if (!confirm('Are you sure you want to unpublish this prompt? It will be removed from the community gallery.')) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${promptId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to unpublish prompt');

      setIsPublic(false);
      alert('Prompt unpublished successfully!');
    } catch (error) {
      console.error('Error unpublishing prompt:', error);
      alert('Failed to unpublish prompt. Please try again.');
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
              {isPublic ? (
                <Button
                  variant="outline"
                  onClick={handleUnpublish}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowPublishModal(true)}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Publish
                </Button>
              )}
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

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Star
                    className={`h-5 w-5 ${favorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                  />
                </Button>
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2">
              {isPublic ? (
                <Button
                  variant="outline"
                  onClick={handleUnpublish}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <XCircle className="h-4 w-4" />
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowPublishModal(true)}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <Globe className="h-4 w-4" />
                  Publish
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
                className="flex-1 gap-2 min-h-[44px]"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Prompt</CardTitle>
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

            {/* Optimization Stats and Actions */}
            {promptData && promptData.optimization_count > 0 && (
              <div className="space-y-3">
                <DetailedOptimizationStats
                  optimizationCount={promptData.optimization_count}
                  optimizedWith={promptData.optimized_with}
                  lastOptimizedAt={promptData.last_optimized_at}
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  {promptData.original_prompt && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOriginalModal(true)}
                        className="gap-2 min-h-[44px] sm:min-h-[36px]"
                      >
                        <Eye className="h-4 w-4" />
                        View Original
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCompareModal(true)}
                        className="gap-2 min-h-[44px] sm:min-h-[36px]"
                      >
                        <GitCompare className="h-4 w-4" />
                        Compare Before & After
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* AI Optimization Actions */}
            {promptData && content.trim() && (
              <div className="p-4 border border-border rounded-lg bg-muted/40 dark:bg-muted/30">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-1 text-sm sm:text-base font-serif">
                      <Sparkles className="h-4 w-4 text-primary" />
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
                        if (!promptId) return;
                        const response = await fetch('/api/optimize', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: content, promptId }),
                        });
                        if (response.ok) {
                          const { optimizedPrompt } = await response.json();
                          setContent(optimizedPrompt);
                          fetchPrompt(promptId);
                        }
                      }}
                      variant="claude"
                      className="gap-2 min-h-[44px] sm:min-h-[40px]"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden xs:inline">Optimize with </span>Claude
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!promptId) return;
                        const response = await fetch('/api/optimize-openai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: content, promptId }),
                        });
                        if (response.ok) {
                          const { optimizedPrompt } = await response.json();
                          setContent(optimizedPrompt);
                          fetchPrompt(promptId);
                        }
                      }}
                      variant="openai"
                      className="gap-2 min-h-[44px] sm:min-h-[40px]"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden xs:inline">Optimize with </span>ChatGPT
                    </Button>
                    <Button onClick={() => setShowDualOptimize(true)} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Sparkles className="h-4 w-4" />
                      Compare Both
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for Edit vs History */}
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="gap-2">
                  <FileEdit className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                  {promptData && promptData.optimization_count > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {promptData.optimization_count}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-6 mt-6">
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
                    promptId={(() => {
                      console.log('[Edit Page] Passing promptId to MarkdownEditor:', promptId);
                      return promptId || undefined;
                    })()}
                    hideOptimizeButtons={true}
                  />
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                {promptId && promptData && (
                  <VersionHistory
                    promptId={promptId}
                    currentVersion={promptData.optimization_count}
                    onRestore={() => {
                      // Refresh the prompt data after restore
                      fetchPrompt(promptId);
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      {promptData?.original_prompt && (
        <>
          <OriginalPromptModal
            isOpen={showOriginalModal}
            onClose={() => setShowOriginalModal(false)}
            originalPrompt={promptData.original_prompt}
            currentPrompt={content}
            createdAt={promptData.created_at}
            onRestore={handleRestoreOriginal}
          />
          <BeforeAfterModal
            isOpen={showCompareModal}
            onClose={() => setShowCompareModal(false)}
            originalPrompt={promptData.original_prompt}
            currentPrompt={content}
            optimizationCount={promptData.optimization_count}
            optimizedWith={promptData.optimized_with}
          />
        </>
      )}

      {/* Dual Optimize View */}
      {showDualOptimize && promptId && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <DualOptimizeView
              promptId={promptId}
              promptText={content}
              currentTags={tags}
              onComplete={(selectedContent) => {
                if (selectedContent) {
                  setContent(selectedContent);
                }
                setShowDualOptimize(false);
                // Refresh the prompt data to get updated optimization count
                if (promptId) {
                  fetchPrompt(promptId);
                }
              }}
              onCancel={() => setShowDualOptimize(false)}
            />
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {promptId && (
        <PublishPromptModal
          open={showPublishModal}
          onOpenChange={setShowPublishModal}
          promptId={promptId}
          defaultTitle={title}
          defaultContent={content}
          defaultTags={tags}
          onPublishSuccess={handlePublishSuccess}
        />
      )}
    </div>
  );
}
