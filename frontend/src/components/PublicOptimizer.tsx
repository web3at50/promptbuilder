'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { DemoBanner } from '@/components/DemoBanner';

export function PublicOptimizer() {
  const [prompt, setPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const {
    isClient,
    canOptimize,
    remainingOptimizations,
    recordOptimization,
    showSignupPrompt,
    setShowSignupPrompt,
  } = useDemoMode();

  const handleOptimize = async () => {
    if (!canOptimize) {
      setShowSignupPrompt(true);
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt to optimize');
      return;
    }

    setLoading(true);
    setError(null);
    setOptimizedPrompt('');

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to optimize prompt');

      const data = await response.json();
      setOptimizedPrompt(data.optimizedPrompt);
      setShowComparison(true);
      recordOptimization();
    } catch (err) {
      setError('Failed to optimize prompt. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!optimizedPrompt) return;
    await navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Demo Banner */}
      {remainingOptimizations > 0 && (
        <DemoBanner remainingOptimizations={remainingOptimizations} />
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Optimize Your AI Prompts with Claude
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Get better AI results with professionally optimized prompts
          </p>
          <p className="text-sm text-muted-foreground">
            ✨ Try it free • No account needed • {remainingOptimizations} {remainingOptimizations === 1 ? 'optimization' : 'optimizations'} remaining
          </p>
        </div>

        {/* Main Optimizer */}
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Enter Your Prompt
              </CardTitle>
              <CardDescription>
                Paste any AI prompt and we&apos;ll optimize it for better results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Example: Write a blog post about climate change..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] text-base"
                  disabled={loading}
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{prompt.length} characters</span>
                  {!canOptimize && (
                    <span className="text-destructive font-medium">
                      Free limit reached • Sign up for unlimited
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={handleOptimize}
                disabled={loading || !prompt.trim() || !canOptimize}
                size="lg"
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Optimizing with Claude AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Optimize with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {optimizedPrompt && (
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Optimized Result
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    {showComparison ? 'Hide' : 'Show'} Comparison
                  </Button>
                </div>
                <CardDescription>
                  Your prompt has been enhanced for better AI results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showComparison && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        📝 Original
                      </h4>
                      <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                        {prompt}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-primary">
                        ✨ Optimized
                      </h4>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm whitespace-pre-wrap">
                        {optimizedPrompt}
                      </div>
                    </div>
                  </div>
                )}

                {!showComparison && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg whitespace-pre-wrap">
                    {optimizedPrompt}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Optimized Prompt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA after optimization */}
          {optimizedPrompt && (
            <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">
                    💾 Want to save this prompt?
                  </h3>
                  <p className="text-muted-foreground">
                    Create a free account to save unlimited prompts, organize with tags, and access from anywhere
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button size="lg" onClick={() => window.location.href = '/signup'}>
                      Create Free Account
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => window.location.href = '/login'}>
                      Sign In
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limit reached message */}
          {!canOptimize && !showSignupPrompt && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold">
                    🎉 You&apos;ve used all 3 free optimizations!
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Create a free account to get unlimited AI optimizations, save your prompts to a personal library, and access them from anywhere.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                    <div className="p-4 bg-background rounded-lg">
                      <div className="text-2xl mb-2">🚀</div>
                      <h4 className="font-semibold mb-1">Unlimited Optimizations</h4>
                      <p className="text-sm text-muted-foreground">
                        Optimize as many prompts as you want with Claude AI
                      </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                      <div className="text-2xl mb-2">💾</div>
                      <h4 className="font-semibold mb-1">Save & Organize</h4>
                      <p className="text-sm text-muted-foreground">
                        Build your personal prompt library with tags and search
                      </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                      <div className="text-2xl mb-2">☁️</div>
                      <h4 className="font-semibold mb-1">Access Anywhere</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync across all your devices automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap pt-2">
                    <Button size="lg" onClick={() => window.location.href = '/signup'}>
                      Create Free Account
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => window.location.href = '/login'}>
                      Already have an account? Sign In
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
