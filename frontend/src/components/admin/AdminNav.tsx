'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, ArrowLeft, AlertTriangle } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

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

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 mb-6">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
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
      </div>
    </div>
  );
}
