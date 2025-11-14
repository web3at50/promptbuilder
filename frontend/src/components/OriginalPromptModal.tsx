'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Calendar, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface OriginalPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  currentPrompt: string;
  createdAt: string;
  onRestore: () => void;
}

export function OriginalPromptModal({
  isOpen,
  onClose,
  originalPrompt,
  currentPrompt,
  createdAt,
  onRestore,
}: OriginalPromptModalProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(originalPrompt);
      // TODO: Add toast notification
      alert('Original prompt copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleRestore = () => {
    if (
      confirm(
        'Are you sure you want to restore the original prompt? This will replace your current content.'
      )
    ) {
      onRestore();
      onClose();
    }
  };

  // Calculate character and word count
  const charCount = originalPrompt.length;
  const wordCount = originalPrompt.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
            Your Original Prompt
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            This is your original input before any AI optimization. It has been
            preserved for reference.
          </DialogDescription>
        </DialogHeader>

        {/* Metadata */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-medium">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="font-medium">{charCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Words</p>
              <p className="font-medium">{wordCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Original Prompt Content */}
        <div className="space-y-2">
          <div className="prose prose-sm dark:prose-invert max-w-none p-3 sm:p-4 border rounded-lg bg-background max-h-[40vh] overflow-y-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {originalPrompt}
            </ReactMarkdown>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> You can restore this original version at
            any time, or copy it to use elsewhere.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCopy} className="gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-[36px]">
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </Button>
          <Button
            variant="default"
            onClick={handleRestore}
            className="gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
            disabled={originalPrompt === currentPrompt}
          >
            <RotateCcw className="h-4 w-4" />
            Restore as Current
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
