'use client';

import { useState, useEffect } from 'react';
import { AdminOverviewCards } from '@/components/admin/AdminOverviewCards';
import { AdminSpendingChart } from '@/components/admin/AdminSpendingChart';
import { AdminUsageChart } from '@/components/admin/AdminUsageChart';
import { AdminTopUsersTable } from '@/components/admin/AdminTopUsersTable';
import { AdminNav } from '@/components/admin/AdminNav';

interface OverviewData {
  total_users: number;
  total_requests: number;
  total_cost: number;
  cost_this_month: number;
  total_tokens: number;
  most_used_provider: string;
  avg_cost_per_request: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  requests_last_30_days: number;
  avg_latency_ms: number;
}

export default function AdminAnalyticsPage() {
  const [overviewData, setOverviewData] = useState<OverviewData>({
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverviewData() {
      try {
        const response = await fetch('/api/admin/analytics/overview');
        if (response.ok) {
          const data = await response.json();
          setOverviewData(data);
        } else {
          console.error('Failed to fetch overview data');
        }
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOverviewData();
  }, []);

  return (
    <div className="container mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
      <AdminNav />

      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Monitor and analyze platform-wide LLM usage and performance metrics
        </p>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          Loading dashboard data...
        </div>
      ) : (
        <>
          <AdminOverviewCards data={overviewData} />

          <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
            <AdminSpendingChart />
            <AdminUsageChart />
          </div>

          <AdminTopUsersTable />
        </>
      )}
    </div>
  );
}
