'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, ArrowLeft } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

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
          </nav>
        </div>
      </div>
    </div>
  );
}
