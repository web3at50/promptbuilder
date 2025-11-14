'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Globe } from 'lucide-react';
import { VALIDATION_LIMITS } from '@/lib/validation';
import { showError } from '@/lib/notifications';

interface PublishPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptId: string;
  defaultTitle: string;
  defaultContent: string;
  defaultTags: string[];
  onPublishSuccess: (shareToken: string, publicUrl: string) => void;
}

export function PublishPromptModal({
  open,
  onOpenChange,
  promptId,
  defaultTitle,
  defaultContent,
  defaultTags,
  onPublishSuccess,
}: PublishPromptModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!title.trim()) {
      showError('Please enter a title before publishing.');
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          content: defaultContent,
          tags: defaultTags,
          category: category || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish prompt');
      }

      const data = await response.json();
      onPublishSuccess(data.share_token, data.public_url);
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing prompt:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to publish prompt. Please try again.'
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Publish to Community
          </DialogTitle>
          <DialogDescription>
            Share your prompt with the community. Others can view, like, and fork it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
              maxLength={VALIDATION_LIMITS.TITLE_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/{VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this prompt does and how to use it"
              rows={3}
              maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/{VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Preview */}
          {defaultTags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {defaultTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Tags from your prompt will be included
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              💡 Your prompt will be publicly visible. Make sure it does not contain
              sensitive information.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
