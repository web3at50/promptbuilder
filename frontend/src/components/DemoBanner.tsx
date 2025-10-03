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
    <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border-b border-purple-500/30 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium">
              🎁 <strong className="text-primary">{remainingOptimizations}</strong> free optimization
              {remainingOptimizations !== 1 ? 's' : ''} remaining •{' '}
              <Link href="/signup" className="underline hover:no-underline text-primary font-semibold">
                Create a free account
              </Link>{' '}
              for unlimited AI optimizations and prompt saving
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
