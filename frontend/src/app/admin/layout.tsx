import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if user is admin before rendering any admin pages
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    redirect('/');
  }

  return <>{children}</>;
}
