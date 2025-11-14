'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ComparisonCard } from './ComparisonCard';
import { GitCompare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DualOptimizeViewProps {
  promptId: string;
  promptText: string;
  currentTags: string[];
  onComplete: (selectedOutput: string | null) => void;
  onCancel: () => void;
}

interface OptimizationResult {
  output: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  latency_ms: number;
  model: string;
}

export function DualOptimizeView({
  promptId,
  promptText,
  currentTags,
  onComplete,
  onCancel,
}: DualOptimizeViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [claudeResult, setClaudeResult] = useState<OptimizationResult | null>(null);
  const [openaiResult, setOpenaiResult] = useState<OptimizationResult | null>(null);
  const [claudeError, setClaudeError] = useState<string | null>(null);
  const [openaiError, setOpenaiError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'claude' | 'openai' | 'neither' | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [versionNumber, setVersionNumber] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleRunComparison = async () => {
    setIsLoading(true);
    setClaudeError(null);
    setOpenaiError(null);
    setClaudeResult(null);
    setOpenaiResult(null);
    setSelectedProvider(null);

    try {
      const response = await fetch(`/api/prompts/${promptId}/compare-both`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error('Failed to run comparison');
      }

      const data = await response.json();

      // Store version number for later use
      if (data.version) {
        setVersionNumber(data.version);
      }

      // Set results
      if (data.claude) {
        setClaudeResult(data.claude);
      } else if (data.errors?.claude) {
        setClaudeError(data.errors.claude);
      }

      if (data.openai) {
        setOpenaiResult(data.openai);
      } else if (data.errors?.openai) {
        setOpenaiError(data.errors.openai);
      }

      setHasRun(true);
    } catch (error) {
      console.error('Error running comparison:', error);
      setClaudeError('Failed to connect to API');
      setOpenaiError('Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClaude = () => {
    setSelectedProvider('claude');
  };

  const handleSelectOpenai = () => {
    setSelectedProvider('openai');
  };

  const handleDiscardClaude = () => {
    if (selectedProvider === 'claude') {
      setSelectedProvider('neither');
    }
  };

  const handleDiscardOpenai = () => {
    if (selectedProvider === 'openai') {
      setSelectedProvider('neither');
    }
  };

  const handleConfirm = async () => {
    if (!versionNumber) {
      console.error('No version number available');
      return;
    }

    setIsConfirming(true);

    try {
      let selectedContent: string | null = null;
      let selectedModel: string | null = null;

      if (selectedProvider === 'claude' && claudeResult) {
        selectedContent = claudeResult.output;
        selectedModel = claudeResult.model;
      } else if (selectedProvider === 'openai' && openaiResult) {
        selectedContent = openaiResult.output;
        selectedModel = openaiResult.model;
      } else if (selectedProvider === 'neither') {
        // User wants to keep current version - just close
        onComplete(null);
        return;
      }

      if (!selectedContent || !selectedModel) {
        console.error('No content selected');
        return;
      }

      // Update the prompts table with the selected optimization
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedContent,
          tags: currentTags,
          optimization_count: versionNumber,
          optimized_with: selectedModel,
          last_optimized_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save selection');
      }

      // Success - call onComplete with the selected content
      onComplete(selectedContent);
    } catch (error) {
      console.error('Error saving selection:', error);
      alert('Failed to save your selection. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const totalCost = (claudeResult?.cost_usd || 0) + (openaiResult?.cost_usd || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6" />
            Compare Both LLMs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Run optimizations with both Claude and ChatGPT, then choose the best result
          </p>
        </div>
      </div>

      {/* Info Alert */}
      {!hasRun && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will run both Claude and ChatGPT optimizations simultaneously. Both results
            will be saved to your history. Estimated cost: ~$0.03-0.05
          </AlertDescription>
        </Alert>
      )}

      {/* Run Button */}
      {!hasRun && (
        <div className="flex justify-center">
          <Button
            onClick={handleRunComparison}
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            <GitCompare className="h-5 w-5" />
            {isLoading ? 'Running Comparison...' : 'Run Dual Optimization'}
          </Button>
        </div>
      )}

      {/* Comparison Grid */}
      {(hasRun || isLoading) && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claude Card */}
            <ComparisonCard
              provider="claude"
              output={claudeResult?.output || null}
              tokens_input={claudeResult?.tokens_input || 0}
              tokens_output={claudeResult?.tokens_output || 0}
              cost_usd={claudeResult?.cost_usd || 0}
              latency_ms={claudeResult?.latency_ms || 0}
              isLoading={isLoading}
              error={claudeError}
              onSelect={handleSelectClaude}
              onDiscard={handleDiscardClaude}
              isSelected={selectedProvider === 'claude'}
              isDiscarded={selectedProvider === 'openai' || selectedProvider === 'neither'}
            />

            {/* OpenAI Card */}
            <ComparisonCard
              provider="openai"
              output={openaiResult?.output || null}
              tokens_input={openaiResult?.tokens_input || 0}
              tokens_output={openaiResult?.tokens_output || 0}
              cost_usd={openaiResult?.cost_usd || 0}
              latency_ms={openaiResult?.latency_ms || 0}
              isLoading={isLoading}
              error={openaiError}
              onSelect={handleSelectOpenai}
              onDiscard={handleDiscardOpenai}
              isSelected={selectedProvider === 'openai'}
              isDiscarded={selectedProvider === 'claude' || selectedProvider === 'neither'}
            />
          </div>

          {/* Summary & Actions */}
          {hasRun && !isLoading && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold">Comparison Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Total cost: ${totalCost.toFixed(4)} • Both results saved to history
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedProvider || isConfirming}
                  >
                    {isConfirming
                      ? 'Saving...'
                      : selectedProvider === 'claude'
                        ? 'Use Claude Version'
                        : selectedProvider === 'openai'
                          ? 'Use ChatGPT Version'
                          : selectedProvider === 'neither'
                            ? 'Keep Current Version'
                            : 'Select a Version'}
                  </Button>
                </div>
              </div>

              {/* Insight */}
              {claudeResult && openaiResult && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    💡 <strong>Insight:</strong> {' '}
                    {claudeResult.cost_usd > openaiResult.cost_usd
                      ? `Claude was ${((claudeResult.cost_usd / openaiResult.cost_usd - 1) * 100).toFixed(0)}% more expensive but `
                      : `ChatGPT was ${((openaiResult.cost_usd / claudeResult.cost_usd - 1) * 100).toFixed(0)}% more expensive but `}
                    {claudeResult.tokens_output > openaiResult.tokens_output
                      ? `Claude generated ${((claudeResult.tokens_output / openaiResult.tokens_output - 1) * 100).toFixed(0)}% more tokens. `
                      : `ChatGPT generated ${((openaiResult.tokens_output / claudeResult.tokens_output - 1) * 100).toFixed(0)}% more tokens. `}
                    {claudeResult.latency_ms < openaiResult.latency_ms
                      ? `Claude was faster by ${((openaiResult.latency_ms - claudeResult.latency_ms) / 1000).toFixed(1)}s.`
                      : `ChatGPT was faster by ${((claudeResult.latency_ms - openaiResult.latency_ms) / 1000).toFixed(1)}s.`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
