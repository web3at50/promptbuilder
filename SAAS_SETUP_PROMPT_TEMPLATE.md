# SaaS Project Setup Prompt Template

> **Instructions:** Replace all `[PLACEHOLDERS]` with your specific app details, then use this entire document as a prompt to an LLM (like Claude) to set up your project.

---

# Project Setup Request

I need you to help me build a complete SaaS application from scratch with the following specifications:

## 🔑 Key Setup Notes

**Authentication Philosophy:**
- **Production:** Email + Google OAuth (full auth options)
- **Local Dev:** Email only (Google OAuth skipped for simplicity)
- **Why?** This streamlines local development while maintaining full auth functionality for testing

**Project Structure:**
- **`setup/` directory:** Always created at root for setup guides/docs - **MUST be in `.gitignore`**
- **Environment Variables:** Always include `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` in both `.env.local` and Vercel
- **Database:** No local Supabase - use live project for both prod and dev, managed via `supabase db push`

---

## 📋 Project Details

**App Name:** `[APP_NAME]` (e.g., "Recipe Organizer", "Homework Tracker", "Prompt Builder")

**App Description:** `[APP_DESCRIPTION]` (e.g., "A beautiful recipe organizer to save, search, and share your favorite recipes")

**GitHub Repository:** `[GITHUB_REPO_URL]` (I've already created this repo and it's empty)

**Supabase Project:**
- Project URL: `[SUPABASE_PROJECT_URL]` (e.g., https://xxxxx.supabase.co)
- Anon Key: `[SUPABASE_ANON_KEY]` (I have this ready)
- Project is already created in Supabase Pro account

**Vercel Account:** Already set up and ready to deploy

---

## 🛠️ Tech Stack (Non-Negotiable)

### Frontend
- **Framework:** Next.js 15.5+ (latest stable)
- **Language:** TypeScript
- **Routing:** App Router (in `frontend/src/app/`)
- **Styling:** Tailwind CSS v4 with custom monochrome theme
- **UI Components:** shadcn/ui (New York style)
- **Fonts:** Geist Sans & Geist Mono

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
  - **Production:** Email/Password + Google OAuth
  - **Local Development:** Email/Password only (no Google OAuth on dev to simplify setup)
- **API:** Next.js API routes in `frontend/src/app/api/`
- **AI Integration:** Anthropic Claude + OpenAI GPT

### Infrastructure
- **Version Control:** Git + GitHub
- **Deployment:** Vercel
- **Database Migrations:** Supabase migrations (no local environment, push with `supabase db push`)

---

## 🎨 Design System

### Color Scheme (Exact OKLCH Values)

Use this **exact** monochrome theme (black/grey/white with shades):

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

### shadcn/ui Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 📂 Directory Structure (Canonical)

Follow this **exact** structure:

```
[APP_NAME]/
├── frontend/                    # Next.js application
│   ├── .next/                   # Build directory (auto-generated)
│   ├── node_modules/            # Dependencies (auto-generated)
│   ├── public/                  # Static assets
│   │   └── favicon.ico
│   ├── src/                     # Source code
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── api/             # API routes
│   │   │   ├── (auth)/          # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── signup/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Home page
│   │   │   └── globals.css      # Global styles
│   │   ├── components/          # React components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── lib/                 # Utilities
│   │   │   ├── supabase/        # Supabase clients
│   │   │   │   ├── client.ts    # Browser client
│   │   │   │   ├── server.ts    # Server client
│   │   │   │   └── middleware.ts # Auth middleware
│   │   │   └── utils.ts         # General utilities
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   └── middleware.ts        # Next.js middleware
│   ├── .env.local               # Environment variables (DO NOT COMMIT)
│   ├── .gitignore
│   ├── components.json          # shadcn config
│   ├── next.config.mjs          # Next.js config
│   ├── package.json
│   ├── postcss.config.mjs       # PostCSS config
│   └── tsconfig.json            # TypeScript config
├── supabase/                    # Database
│   ├── migrations/              # SQL migrations
│   │   ├── .gitkeep
│   │   └── [numbered migrations]
│   ├── functions/               # Edge Functions (if needed)
│   │   └── .gitkeep
│   └── config.toml              # Supabase config
├── temp/                        # Setup files, troubleshooting guides (DO NOT COMMIT)
│   ├── AUTH_TROUBLESHOOTING.md
│   ├── GOOGLE_OAUTH_WORKSPACE_SETUP_GUIDE.md
│   └── [other setup docs]
├── .gitignore                   # MUST include temp/ directory
└── README.md
```

---

## 🗄️ Database Schema

### Tables to Create

`[DEFINE YOUR DATABASE SCHEMA HERE - EXAMPLE BELOW]`

**Example for a Recipe App:**

```sql
-- Table: recipes
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  instructions TEXT,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX recipes_user_id_idx ON recipes(user_id);
CREATE INDEX recipes_created_at_idx ON recipes(created_at DESC);
```

### Required Auth Tables (Always Include)

```sql
-- Table: profiles (user profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.email,
      NEW.raw_user_meta_data->>'email',
      'no-email@placeholder.com'
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 🔐 Authentication Setup

### Email Authentication (Production + Local)
- **Setup:** Enable in Supabase Dashboard → Authentication → Providers
- **For production:** Enable "Confirm email" (recommended for security)
- **For local development:** Disable email confirmation for faster testing
- **Why both?** Email auth on local dev allows you to test the full user experience without complexity

### Google OAuth (Production Only)
- **Setup:** Follow the comprehensive guide in: **`GOOGLE_OAUTH_WORKSPACE_SETUP_GUIDE.md`**
- **Configuration:** Client ID and Secret added to Supabase Dashboard
- **Redirect URI:** `https://[your-supabase-project].supabase.co/auth/v1/callback`
- **Local development:** Skip Google OAuth setup - not needed on dev for simplicity
- **Why skip on local?** Reduces setup complexity; email auth is sufficient for testing

### Authentication Strategy
- **Production:** Email + Google OAuth (full auth options for users)
- **Local Development:** Email only (faster setup, easier testing)
- **Database:** Use live Supabase project for both prod and dev (no local Supabase environment)
- **Middleware:** Use Supabase Auth middleware to protect routes
- **Troubleshooting:** See **`AUTH_TROUBLESHOOTING.md`** for common issues and solutions

> 💡 **Tip:** This auth setup is designed to get you up and running quickly. Email auth on local dev gives you full testing capability without the overhead of configuring Google OAuth locally.

---

## 📦 Required Dependencies

### Production Dependencies
```json
{
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.58.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.544.0",
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "tailwind-merge": "^3.3.1"
}
```

### Dev Dependencies
```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^22",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "15.5.4",
  "tailwindcss": "^4",
  "tw-animate-css": "^1.4.0",
  "typescript": "^5"
}
```

### shadcn/ui Components to Install
Start with these essentials:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add separator
npx shadcn@latest add tabs
```

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Initialize Project

1. **Clone the empty GitHub repo:**
   ```bash
   git clone [GITHUB_REPO_URL]
   cd [APP_NAME]
   ```

2. **Create temp directory for setup files:**
   ```bash
   mkdir temp
   ```

3. **Update `.gitignore` to exclude temp directory:**
   ```bash
   echo "temp/" >> .gitignore
   ```
   > ⚠️ **Important:** The `temp/` directory will contain setup guides and troubleshooting docs that should NOT be committed to GitHub.

4. **Create Next.js app in `frontend/` directory:**
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```
   - Use App Router: Yes
   - Use Turbopack: No
   - Customize import alias: Yes (@/*)

5. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

### Step 2: Configure Tailwind CSS v4

1. **Install Tailwind v4 dependencies:**
   ```bash
   npm install tailwindcss@next @tailwindcss/postcss@next tw-animate-css
   ```

2. **Update `src/app/globals.css`** with the exact color scheme provided above (OKLCH values)

3. **Create/update `postcss.config.mjs`:**
   ```js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   };
   ```

4. **Remove `tailwind.config.ts`** (Tailwind v4 uses CSS-first config)

### Step 3: Install shadcn/ui

1. **Initialize shadcn:**
   ```bash
   npx shadcn@latest init
   ```
   - Style: New York
   - Base color: Neutral
   - CSS variables: Yes
   - RSC: Yes
   - Use TypeScript: Yes

2. **Install core components:**
   ```bash
   npx shadcn@latest add button card input label dropdown-menu dialog separator tabs
   ```

### Step 4: Set Up Supabase

1. **Install Supabase packages:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Create environment variables (`.env.local`):**
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=[SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]

   # AI API Keys (for local development - also add to Vercel)
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```

3. **Create Supabase clients:**

   **`frontend/src/lib/supabase/client.ts`** (browser):
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```

   **`frontend/src/lib/supabase/server.ts`** (server):
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';

   export async function createClient() {
     const cookieStore = await cookies();

     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return cookieStore.getAll();
           },
           setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               );
             } catch {
               // Server Component - ignore
             }
           },
         },
       }
     );
   }
   ```

   **`frontend/src/lib/supabase/middleware.ts`** (auth middleware):
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { NextResponse, type NextRequest } from 'next/server';

   export async function updateSession(request: NextRequest) {
     let supabaseResponse = NextResponse.next({ request });

     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return request.cookies.getAll();
           },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value, options }) =>
               request.cookies.set(name, value)
             );
             supabaseResponse = NextResponse.next({ request });
             cookiesToSet.forEach(({ name, value, options }) =>
               supabaseResponse.cookies.set(name, value, options)
             );
           },
         },
       }
     );

     const {
       data: { user },
     } = await supabase.auth.getUser();

     // Protected paths - customize based on your app
     const protectedPaths = ['/new', '/edit', '/profile'];
     const isProtectedPath =
       request.nextUrl.pathname === '/' ||
       protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

     // Redirect to login if not authenticated
     if (!user && isProtectedPath) {
       const url = request.nextUrl.clone();
       url.pathname = '/login';
       return NextResponse.redirect(url);
     }

     // Redirect to home if authenticated and on auth pages
     if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
       const url = request.nextUrl.clone();
       url.pathname = '/';
       return NextResponse.redirect(url);
     }

     return supabaseResponse;
   }
   ```

4. **Create `frontend/src/middleware.ts`:**
   ```typescript
   import { type NextRequest } from 'next/server';
   import { updateSession } from '@/lib/supabase/middleware';

   export async function middleware(request: NextRequest) {
     return await updateSession(request);
   }

   export const config = {
     matcher: [
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   };
   ```

### Step 5: Create Database Migrations

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Create Supabase directory structure:**
   ```bash
   mkdir -p supabase/migrations supabase/functions
   touch supabase/migrations/.gitkeep supabase/functions/.gitkeep
   ```

3. **Create migration files:**

   **`supabase/migrations/001_initial_schema.sql`:**
   ```sql
   -- [PASTE YOUR DATABASE SCHEMA HERE]
   -- Include your app-specific tables (recipes, homework, prompts, etc.)
   ```

   **`supabase/migrations/002_add_auth_and_profiles.sql`:**
   ```sql
   -- [PASTE THE PROFILES TABLE AND TRIGGER FROM ABOVE]
   ```

4. **Push migrations to Supabase:**
   ```bash
   supabase db push
   ```

### Step 6: Create Authentication Pages

1. **Create login page (`frontend/src/app/(auth)/login/page.tsx`):**
   ```typescript
   import { LoginForm } from '@/components/auth/login-form';

   export default function LoginPage() {
     return (
       <div className="flex min-h-screen items-center justify-center">
         <LoginForm />
       </div>
     );
   }
   ```

2. **Create signup page (`frontend/src/app/(auth)/signup/page.tsx`):**
   ```typescript
   import { SignupForm } from '@/components/auth/signup-form';

   export default function SignupPage() {
     return (
       <div className="flex min-h-screen items-center justify-center">
         <SignupForm />
       </div>
     );
   }
   ```

3. **Create auth forms in `frontend/src/components/auth/`:**
   - `login-form.tsx` - Email/password + Google OAuth login
   - `signup-form.tsx` - Email/password + Google OAuth signup

   **Example Login Form:**
   ```typescript
   'use client';

   import { useState } from 'react';
   import { createClient } from '@/lib/supabase/client';
   import { Button } from '@/components/ui/button';
   import { Input } from '@/components/ui/input';
   import { Label } from '@/components/ui/label';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
   import { useRouter } from 'next/navigation';

   export function LoginForm() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);
     const router = useRouter();
     const supabase = createClient();

     const handleEmailLogin = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoading(true);
       setError(null);

       const { error } = await supabase.auth.signInWithPassword({
         email,
         password,
       });

       if (error) {
         setError(error.message);
         setLoading(false);
       } else {
         router.push('/');
         router.refresh();
       }
     };

     const handleGoogleLogin = async () => {
       setLoading(true);
       const { error } = await supabase.auth.signInWithOAuth({
         provider: 'google',
         options: {
           redirectTo: `${window.location.origin}/auth/callback`,
         },
       });

       if (error) {
         setError(error.message);
         setLoading(false);
       }
     };

     return (
       <Card className="w-full max-w-md">
         <CardHeader>
           <CardTitle>Sign In</CardTitle>
           <CardDescription>Sign in to your account</CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleEmailLogin} className="space-y-4">
             <div>
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div>
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
             {error && <p className="text-sm text-destructive">{error}</p>}
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? 'Signing in...' : 'Sign In'}
             </Button>
           </form>

           <div className="relative my-4">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">Or</span>
             </div>
           </div>

           <Button
             type="button"
             variant="outline"
             className="w-full"
             onClick={handleGoogleLogin}
             disabled={loading}
           >
             Continue with Google
           </Button>

           <p className="mt-4 text-center text-sm text-muted-foreground">
             Don't have an account?{' '}
             <a href="/signup" className="underline">
               Sign up
             </a>
           </p>
         </CardContent>
       </Card>
     );
   }
   ```

   > 💡 **Note:** The Google OAuth button will be present in both local and production environments. In local development, if Google OAuth is not configured in Supabase, the button will simply show an error when clicked. This is expected behavior - users can still use email authentication for local testing.

4. **Create auth callback route (`frontend/src/app/auth/callback/route.ts`):**
   ```typescript
   import { createClient } from '@/lib/supabase/server';
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {
     const { searchParams, origin } = new URL(request.url);
     const code = searchParams.get('code');
     const next = searchParams.get('next') ?? '/';

     if (code) {
       const supabase = await createClient();
       const { error } = await supabase.auth.exchangeCodeForSession(code);
       if (!error) {
         return NextResponse.redirect(`${origin}${next}`);
       }
     }

     return NextResponse.redirect(`${origin}/login`);
   }
   ```

### Step 7: Configure Supabase Authentication

1. **In Supabase Dashboard → Authentication → Providers:**
   - ✅ Enable Email provider
   - ✅ Enable "Confirm email" (for production)
   - ✅ Enable Google provider (add Client ID and Secret)

2. **In Supabase Dashboard → Authentication → URL Configuration:**
   - Site URL: `https://[your-app].vercel.app`
   - Redirect URLs:
     - `https://[your-app].vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

3. **For Google OAuth setup, follow:**
   - Reference: `GOOGLE_OAUTH_WORKSPACE_SETUP_GUIDE.md`
   - Create OAuth client in Google Cloud Console
   - Add redirect URI: `https://[supabase-project].supabase.co/auth/v1/callback`

### Step 8: Build App-Specific Features

`[CUSTOMIZE THIS SECTION BASED ON YOUR APP]`

**Example for Recipe App:**
1. Create API routes in `frontend/src/app/api/recipes/`
2. Create pages: `/recipes`, `/recipes/new`, `/recipes/[id]`
3. Build components: RecipeCard, RecipeForm, RecipeList
4. Add search and filter functionality

### Step 9: Deploy to Vercel

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **In Vercel Dashboard:**
   - Import GitHub repository
   - Set root directory to `frontend/`
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `ANTHROPIC_API_KEY` (always include for AI features)
     - `OPENAI_API_KEY` (always include for AI features)
   - Deploy!

3. **After deployment:**
   - Update Supabase Site URL to Vercel URL
   - Update Google OAuth redirect URI (if using)
   - Test authentication flow

---

## 🐛 Troubleshooting

### Common Issues

1. **"Database error saving new user"**
   - Check RLS policies on `profiles` table
   - Verify INSERT policy exists
   - See: `AUTH_TROUBLESHOOTING.md` → Issue 2

2. **Middleware redirecting all routes**
   - Never use `'/'` in `startsWith()` check
   - See: `AUTH_TROUBLESHOOTING.md` → Issue 1

3. **Google OAuth not working**
   - Verify redirect URI matches exactly
   - Check test users are added (if in Testing mode)
   - See: `GOOGLE_OAUTH_WORKSPACE_SETUP_GUIDE.md`

4. **Trigger function failing**
   - Ensure NULL email handling with COALESCE
   - Add exception blocks
   - See: `AUTH_TROUBLESHOOTING.md` → Issue 3

---

## 📚 Reference Documents

You have access to these comprehensive guides:

1. **`AUTH_TROUBLESHOOTING.md`**
   - Middleware path matching issues
   - RLS policy problems
   - Trigger function errors
   - Solutions and lessons learned

2. **`GOOGLE_OAUTH_WORKSPACE_SETUP_GUIDE.md`**
   - Complete Google Cloud Console setup
   - OAuth 2.0 configuration
   - Supabase integration
   - Testing and publishing

3. **`frontend_nextjs_standard_readme.md`**
   - Canonical Next.js directory structure
   - App Router conventions
   - Standard file locations

4. **`supabase_project_layout_readme.md`**
   - Supabase directory structure
   - Migration file naming
   - Functions and seed data

**Use these documents to:**
- Solve authentication issues
- Follow best practices
- Maintain consistency across projects

---

## ✅ Final Checklist

Before marking the project as complete, verify:

### Frontend
- [ ] Next.js 15+ installed with TypeScript
- [ ] App Router structure in `frontend/src/app/`
- [ ] Tailwind v4 configured with exact OKLCH colors
- [ ] shadcn/ui installed (New York style, neutral base)
- [ ] Geist Sans and Geist Mono fonts configured
- [ ] All UI components responsive

### Authentication
- [ ] Email authentication working
- [ ] Google OAuth configured and working
- [ ] Auth middleware protecting routes correctly
- [ ] Login and signup pages created
- [ ] Auth callback route working

### Database
- [ ] All migrations pushed to Supabase
- [ ] `profiles` table with RLS policies
- [ ] App-specific tables with RLS policies
- [ ] Auto-create profile trigger working
- [ ] NULL email handling in trigger

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Environment variables set in Vercel
- [ ] Supabase Site URL updated to Vercel URL
- [ ] Google OAuth redirect URI updated (if using)
- [ ] Production authentication tested

### Multi-Tenancy
- [ ] All tables have `user_id` foreign key
- [ ] RLS policies filter by `auth.uid() = user_id`
- [ ] Users can only see their own data
- [ ] Tested with multiple user accounts

---

## 🎯 Success Criteria

The project is complete when:

1. ✅ Users can sign up with email or Google
2. ✅ Users can sign in and see their profile
3. ✅ Users can create, read, update, delete their data
4. ✅ Users cannot see other users' data (multi-tenancy verified)
5. ✅ App is deployed and accessible via Vercel URL
6. ✅ UI matches the monochrome theme (black/grey/white)
7. ✅ All pages are responsive (desktop + mobile)
8. ✅ No errors in browser console
9. ✅ No errors in Supabase logs

---

## 📝 Notes for LLM

When implementing this setup:

1. **Follow the structure exactly** - Don't deviate from the canonical directory layout
2. **Use the exact color scheme** - Copy/paste the OKLCH values, don't modify
3. **Reference the troubleshooting docs** - If you encounter auth issues, check `AUTH_TROUBLESHOOTING.md`
4. **Test multi-tenancy** - Always verify RLS policies are working
5. **Push migrations manually** - Use `supabase db push`, no local environment
6. **Keep it simple** - Start with core functionality, add features incrementally
7. **Ask for clarification** - If the database schema is unclear, ask for specifics

---

**Template Version:** 1.0.0
**Last Updated:** October 3, 2025
**Compatible With:** Next.js 15+, Tailwind v4, Supabase, shadcn/ui
