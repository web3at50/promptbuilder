import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
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
            Sign in to access your prompts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <SignInForm />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link
              href="/reset-password"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-foreground font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
