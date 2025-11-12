import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { AdminOverviewCards } from '@/components/admin/AdminOverviewCards';
import { AdminSpendingChart } from '@/components/admin/AdminSpendingChart';
import { AdminUsageChart } from '@/components/admin/AdminUsageChart';
import { AdminTopUsersTable } from '@/components/admin/AdminTopUsersTable';
import { AdminNav } from '@/components/admin/AdminNav';

async function getOverviewData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/admin/analytics/overview`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch overview data');
  }

  return response.json();
}

export default async function AdminAnalyticsPage() {
  // Check if user is admin
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    redirect('/');
  }

  let overviewData;
  try {
    overviewData = await getOverviewData();
  } catch (error) {
    console.error('Error fetching overview data:', error);
    overviewData = {
      total_users: 0,
      total_requests: 0,
      total_cost: 0,
      cost_this_month: 0,
      total_tokens: 0,
      most_used_provider: 'N/A',
      avg_cost_per_request: 0,
      successful_requests: 0,
      failed_requests: 0,
      success_rate: 0,
      requests_last_30_days: 0,
      avg_latency_ms: 0,
    };
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <AdminNav />

      <div>
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze platform-wide LLM usage and performance metrics
        </p>
      </div>

      <AdminOverviewCards data={overviewData} />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <AdminSpendingChart />
        <AdminUsageChart />
      </div>

      <AdminTopUsersTable />
    </div>
  );
}
