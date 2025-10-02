'use client';

import { useState, useEffect } from 'react';

const DEMO_COUNT_KEY = 'demo_optimization_count';
const MAX_DEMO_OPTIMIZATIONS = 2;

export function useDemoMode() {
  const [count, setCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(DEMO_COUNT_KEY);
    setCount(parseInt(stored || '0', 10));
  }, []);

  const canOptimize = count < MAX_DEMO_OPTIMIZATIONS;
  const remainingOptimizations = MAX_DEMO_OPTIMIZATIONS - count;

  const recordOptimization = () => {
    if (!isClient) return;

    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem(DEMO_COUNT_KEY, newCount.toString());

    if (newCount >= MAX_DEMO_OPTIMIZATIONS) {
      setShowSignupPrompt(true);
    }
  };

  const resetDemo = () => {
    if (!isClient) return;

    setCount(0);
    localStorage.removeItem(DEMO_COUNT_KEY);
    setShowSignupPrompt(false);
  };

  return {
    isClient,
    count,
    canOptimize,
    remainingOptimizations,
    recordOptimization,
    showSignupPrompt,
    setShowSignupPrompt,
    resetDemo,
  };
}
