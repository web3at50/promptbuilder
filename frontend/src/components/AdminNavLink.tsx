'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface AdminNavLinkProps {
  onClick: () => void;
  isMobile?: boolean;
}

export function AdminNavLink({ onClick, isMobile = false }: AdminNavLinkProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin status client-side
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.isAdmin || false);
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Don't render anything while loading or if not admin
  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`gap-3 ${isMobile ? 'w-full justify-start min-h-[48px] text-base' : ''}`}
    >
      <Shield className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-purple-500`} />
      <span className="text-purple-500 font-medium">Admin</span>
    </Button>
  );
}
