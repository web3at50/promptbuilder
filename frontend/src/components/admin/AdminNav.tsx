'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { BarChart3, FileText, ArrowLeft, AlertTriangle, Menu, X } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch pending count
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/admin/pending-prompts?status=pending');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.counts?.pending || 0);
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentPageTitle = () => {
    if (pathname === '/admin/analytics') return 'Overview';
    if (pathname === '/admin/analytics/logs') return 'Usage Logs';
    if (pathname === '/admin/pending-prompts') return 'Moderation';
    return 'Admin';
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2 min-h-[40px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>
            <div className="h-6 w-px bg-border" />
            <nav className="flex items-center gap-1">
              <Button
                variant={pathname === '/admin/analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => router.push('/admin/analytics')}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={pathname === '/admin/analytics/logs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => router.push('/admin/analytics/logs')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Usage Logs
              </Button>
              <Button
                variant={pathname === '/admin/pending-prompts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => router.push('/admin/pending-prompts')}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Moderation
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </nav>
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="gap-2 shrink-0 min-h-[44px] px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Back</span>
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-bold truncate">{getCurrentPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-[44px] min-w-[44px]"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mt-4 pb-4 space-y-2 border-t pt-4 animate-in slide-in-from-top-4 duration-200">
              <Button
                variant={pathname === '/admin/analytics' ? 'default' : 'ghost'}
                onClick={() => {
                  router.push('/admin/analytics');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-3 min-h-[48px] text-base"
              >
                <BarChart3 className="h-5 w-5" />
                Overview
              </Button>
              <Button
                variant={pathname === '/admin/analytics/logs' ? 'default' : 'ghost'}
                onClick={() => {
                  router.push('/admin/analytics/logs');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-3 min-h-[48px] text-base"
              >
                <FileText className="h-5 w-5" />
                Usage Logs
              </Button>
              <Button
                variant={pathname === '/admin/pending-prompts' ? 'default' : 'ghost'}
                onClick={() => {
                  router.push('/admin/pending-prompts');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-3 min-h-[48px] text-base"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    Moderation
                  </div>
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="px-2 py-1">
                      {pendingCount}
                    </Badge>
                  )}
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
