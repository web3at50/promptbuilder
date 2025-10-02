'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface DemoBannerProps {
  remainingOptimizations: number;
}

export function DemoBanner({ remainingOptimizations }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || remainingOptimizations <= 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <p className="text-sm">
              <strong>{remainingOptimizations}</strong> free optimization
              {remainingOptimizations !== 1 ? 's' : ''} remaining.{' '}
              <Link href="/signup" className="underline hover:no-underline">
                Create an account
              </Link>{' '}
              to save prompts and get unlimited optimizations.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
