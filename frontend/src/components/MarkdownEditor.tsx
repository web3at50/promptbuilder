'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Sparkles } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your prompt here...',
}: MarkdownEditorProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (!value.trim()) return;

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value }),
      });

      if (!response.ok) throw new Error('Failed to optimize');

      const { optimizedPrompt } = await response.json();
      onChange(optimizedPrompt);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      alert('Failed to optimize prompt. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {value.length} characters · {value.split(/\s+/).filter(Boolean).length} words
        </div>
        <Button
          onClick={handleOptimize}
          disabled={isOptimizing || !value.trim()}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Optimize with Claude
            </>
          )}
        </Button>
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
