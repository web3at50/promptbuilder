'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Wand2 } from 'lucide-react';
import { VALIDATION_LIMITS } from '@/lib/validation';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  promptId?: string;
  onBeforeOptimize?: () => Promise<string | undefined>;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your prompt here...',
  promptId,
  onBeforeOptimize,
}: MarkdownEditorProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingWith, setOptimizingWith] = useState<'claude' | 'openai' | null>(null);

  const handleOptimize = async (provider: 'claude' | 'openai') => {
    if (!value.trim()) return;

    console.log('[MarkdownEditor] handleOptimize called with promptId:', promptId);

    // If no promptId and onBeforeOptimize callback exists, try to auto-save first
    let finalPromptId = promptId;
    if (!finalPromptId && onBeforeOptimize) {
      console.log('[MarkdownEditor] No promptId - calling onBeforeOptimize to auto-save...');
      const savedId = await onBeforeOptimize();
      if (!savedId) {
        console.log('[MarkdownEditor] Auto-save failed or was cancelled');
        return; // Don't proceed if auto-save failed
      }
      finalPromptId = savedId;
      console.log('[MarkdownEditor] Auto-save successful, using promptId:', finalPromptId);
    }

    if (!finalPromptId) {
      console.warn('[MarkdownEditor] WARNING: promptId is undefined/null - optimization tracking will not work!');
    }

    setIsOptimizing(true);
    setOptimizingWith(provider);
    try {
      const endpoint = provider === 'claude' ? '/api/optimize' : '/api/optimize-openai';
      const requestBody = { prompt: value, promptId: finalPromptId };
      console.log('[MarkdownEditor] Sending request to', endpoint, 'with body:', requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to optimise');

      const { optimizedPrompt } = await response.json();
      onChange(optimizedPrompt);
    } catch (error) {
      console.error('Error optimising prompt:', error);
      alert('Failed to optimise prompt. Please try again.');
    } finally {
      setIsOptimizing(false);
      setOptimizingWith(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {value.length}/{VALIDATION_LIMITS.CONTENT_MAX_LENGTH} characters · {value.split(/\s+/).filter(Boolean).length} words
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleOptimize('claude')}
            disabled={isOptimizing || !value.trim()}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            {isOptimizing && optimizingWith === 'claude' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimising...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Optimise with Claude
              </>
            )}
          </Button>
          <Button
            onClick={() => handleOptimize('openai')}
            disabled={isOptimizing || !value.trim()}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            {isOptimizing && optimizingWith === 'openai' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimising...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Optimise with ChatGPT
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={VALIDATION_LIMITS.CONTENT_MAX_LENGTH}
            className="min-h-[400px] font-mono text-sm resize-none"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card className="min-h-[400px] p-6 prose prose-sm dark:prose-invert max-w-none">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">
                Nothing to preview yet. Start writing your prompt!
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
