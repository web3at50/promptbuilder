'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  currentPrompt: string;
  optimizationCount: number;
  optimizedWith?: string | null;
}

export function BeforeAfterModal({
  isOpen,
  onClose,
  originalPrompt,
  currentPrompt,
  optimizationCount,
  optimizedWith,
}: BeforeAfterModalProps) {
  // Calculate statistics
  const originalCharCount = originalPrompt.length;
  const currentCharCount = currentPrompt.length;
  const originalWordCount = originalPrompt
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const currentWordCount = currentPrompt
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const charDiff = currentCharCount - originalCharCount;
  const wordDiff = currentWordCount - originalWordCount;
  const charDiffPercent =
    originalCharCount > 0
      ? ((charDiff / originalCharCount) * 100).toFixed(1)
      : '0';
  const wordDiffPercent =
    originalWordCount > 0
      ? ((wordDiff / originalWordCount) * 100).toFixed(1)
      : '0';

  const getProvider = (model: string | null) => {
    if (!model) return 'AI';
    if (model.includes('claude')) return 'Claude';
    if (model.includes('gpt')) return 'ChatGPT';
    return 'AI';
  };

  const provider = getProvider(optimizedWith || null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Before & After Comparison
          </DialogTitle>
          <DialogDescription>
            Compare your original prompt with the AI-optimized version
            {optimizationCount > 1 &&
              ` (optimized ${optimizationCount} times)`}
          </DialogDescription>
        </DialogHeader>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm font-medium">Optimized With</p>
            <p className="text-2xl font-bold text-primary">{provider}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Character Change</p>
            <p
              className={`text-2xl font-bold ${
                charDiff > 0
                  ? 'text-green-600 dark:text-green-400'
                  : charDiff < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
              }`}
            >
              {charDiff > 0 ? '+' : ''}
              {charDiff} ({charDiffPercent > '0' ? '+' : ''}
              {charDiffPercent}%)
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Word Change</p>
            <p
              className={`text-2xl font-bold ${
                wordDiff > 0
                  ? 'text-green-600 dark:text-green-400'
                  : wordDiff < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
              }`}
            >
              {wordDiff > 0 ? '+' : ''}
              {wordDiff} ({wordDiffPercent > '0' ? '+' : ''}
              {wordDiffPercent}%)
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original (Before) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                📝 Original
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {originalCharCount} chars
                </span>
                <span>{originalWordCount} words</span>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-background min-h-[300px] max-h-[500px] overflow-y-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {originalPrompt}
              </ReactMarkdown>
            </div>
          </div>

          {/* Current (After) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                ✨ Optimized
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {currentCharCount} chars
                </span>
                <span>{currentWordCount} words</span>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 min-h-[300px] max-h-[500px] overflow-y-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentPrompt}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>What changed?</strong>{' '}
            {charDiff > 0 && wordDiff > 0
              ? `${provider} expanded your prompt, adding ${Math.abs(charDiff)} characters and ${Math.abs(wordDiff)} words for more detail and clarity.`
              : charDiff < 0 && wordDiff < 0
                ? `${provider} made your prompt more concise, removing ${Math.abs(charDiff)} characters and ${Math.abs(wordDiff)} words while preserving meaning.`
                : charDiff === 0 && wordDiff === 0
                  ? `${provider} restructured your prompt without changing the length.`
                  : `${provider} refined your prompt with ${Math.abs(charDiff)} character changes and ${Math.abs(wordDiff)} word changes.`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
