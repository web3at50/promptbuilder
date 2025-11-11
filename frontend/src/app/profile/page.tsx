import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, Sparkles, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await currentUser();
  const supabase = await createClerkSupabaseClient();

  // Get prompts count
  const { count: promptsCount } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get optimizations count
  const { count: optimizationsCount } = await supabase
    .from('optimization_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and view your statistics
            </p>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 py-3 border-b">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">
                    {user?.primaryEmailAddress?.emailAddress ||
                     user?.emailAddresses[0]?.emailAddress ||
                     'No email'}
                  </p>
                </div>
              </div>

              {user?.firstName && (
                <div className="flex items-center gap-3 py-3 border-b">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {user.firstName} {user.lastName || ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 py-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Member Since
                  </p>
                  <p className="font-medium">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Prompts
                    </p>
                    <p className="text-2xl font-bold">{promptsCount || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      AI Optimizations
                    </p>
                    <p className="text-2xl font-bold">
                      {optimizationsCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To manage your account settings, security, and password, visit your Clerk account dashboard.
              </p>
              <Link href="https://accounts.clerk.dev/user" target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  Manage Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
