'use client';

import { useEffect, useState } from 'react';
import { PromptOptimization } from '@/types';
import { VersionCard } from './VersionCard';
import { History, Loader2 } from 'lucide-react';

interface VersionHistoryProps {
  promptId: string;
  currentVersion: number;
  onRestore: () => void; // Callback to refresh the page after restore
}

export function VersionHistory({
  promptId,
  currentVersion,
  onRestore,
}: VersionHistoryProps) {
  const [optimizations, setOptimizations] = useState<PromptOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/prompts/${promptId}/optimizations`);

      if (!response.ok) {
        throw new Error('Failed to fetch optimization history');
      }

      const data = await response.json();
      setOptimizations(data.optimizations || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      setRestoringId(versionId);

      const response = await fetch(
        `/api/prompts/${promptId}/optimizations/restore/${versionId}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      const data = await response.json();

      // Show success message
      alert(data.message || 'Version restored successfully!');

      // Callback to refresh the parent page
      onRestore();
    } catch (err) {
      console.error('Error restoring version:', err);
      alert(err instanceof Error ? err.message : 'Failed to restore version');
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading optimization history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center border rounded-lg bg-destructive/10 border-destructive/50">
        <p className="text-sm text-destructive font-medium">Error loading history</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-3 text-sm underline text-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (optimizations.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg border-dashed">
        <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h3 className="font-semibold mb-1">No Optimization History Yet</h3>
        <p className="text-sm text-muted-foreground">
          Optimization versions will appear here after you optimize this prompt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Optimization History
          </h3>
          <p className="text-sm text-muted-foreground">
            {optimizations.length} version{optimizations.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 relative">
        {/* Vertical line connecting versions */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {optimizations.map((optimization) => (
          <div key={optimization.id} className="relative pl-14">
            {/* Timeline dot */}
            <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />

            <VersionCard
              optimization={optimization}
              isLatest={optimization.version === currentVersion}
              onRestore={handleRestore}
              isRestoring={restoringId === optimization.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
