'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserStats {
  user_id: string;
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  avg_latency: number;
  last_activity: string;
  user: {
    email?: string;
    clerk_username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export function AdminTopUsersTable() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/analytics/users');
        const result = await response.json();
        setUsers(result.users?.slice(0, 10) || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getUserDisplayName = (user: UserStats['user']) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.clerk_username || user.email || 'Unknown User';
  };

  const getUserInitials = (user: UserStats['user']) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Users by Spend</CardTitle>
        <CardDescription>Users with highest total costs</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading user data...
          </div>
        ) : users.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No user data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userStat) => (
                <TableRow key={userStat.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userStat.user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(userStat.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {getUserDisplayName(userStat.user)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {userStat.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {userStat.total_requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${userStat.total_cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={userStat.success_rate >= 95 ? 'default' : 'secondary'}
                      className={
                        userStat.success_rate >= 95
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                      }
                    >
                      {userStat.success_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {(userStat.total_tokens / 1000).toFixed(0)}K
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
