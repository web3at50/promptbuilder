import Link from 'next/link';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <p className="text-sm text-muted-foreground">
            Reset your password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>
              No worries, we&apos;ll send you reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetForm />
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
