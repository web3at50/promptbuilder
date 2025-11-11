import { SignUp } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <p className="text-sm text-muted-foreground">
            Create an account to save and optimize your prompts
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}
