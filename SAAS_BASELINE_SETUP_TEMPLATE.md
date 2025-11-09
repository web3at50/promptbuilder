# 🚀 SaaS Baseline Setup Template

> **Purpose:** This template gets you to a **deployed baseline** with authentication, monochrome styling, and project structure. Once the baseline is live, you customize it for your specific app.

---

# Instructions for LLM

When I provide this filled-out template to you:

1. ✅ **Create a plan** outlining all setup steps
2. ✅ **Create a todo list** to track progress
3. ✅ **Build the baseline** following the specifications below
4. ✅ **Get to deployment** - live site with auth on Vercel

**Goal:** A working, deployed site with authentication, ready to customize.

---

# PART 1: Fill Out These Details

## 📋 Project Information

**App Name:** `[APP_NAME]`
Example: "Recipe Organizer", "Homework Tracker", "Budget Planner"

**App Description (one sentence):** `[APP_DESCRIPTION]`
Example: "A beautiful app to organize and share your favorite recipes"

**GitHub Repository URL:** `[GITHUB_REPO_URL]`
Example: https://github.com/yourusername/recipe-app
Status: ✅ Empty repo already created

**Supabase Project:**
- Project URL: `[SUPABASE_PROJECT_URL]`
  Example: https://abcdefghijk.supabase.co
- Project Ref: `[SUPABASE_PROJECT_REF]`
  Example: abcdefghijk (from the URL)
- Anon Key: `[SUPABASE_ANON_KEY]`
  Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- Status: ✅ Project created in Supabase Pro

**API Keys:**
- Anthropic API Key: `[ANTHROPIC_API_KEY]`
- OpenAI API Key: `[OPENAI_API_KEY]`

**Tech Stack Versions:**
- Option 1: Let LLM search for latest stable compatible versions ⬜
- Option 2: Use specific versions below ⬜

If Option 2, specify:
- Next.js: `[NEXTJS_VERSION]` (e.g., 15.5.4)
- React: `[REACT_VERSION]` (e.g., 19.1.0)
- Tailwind CSS: `[TAILWIND_VERSION]` (e.g., 4.0.0)
- TypeScript: `[TYPESCRIPT_VERSION]` (e.g., 5.7.2)

---

# PART 2: What I've Already Done

Before running this template, I have completed:

## ✅ GitHub Setup
- [x] Created empty GitHub repository at `[GITHUB_REPO_URL]`
- [x] Repository is public/private (specify if needed)

## ✅ Supabase Setup
- [x] Created Supabase project
- [x] Enabled Email provider in Authentication → Providers
- [x] Enabled "Confirm email" in Email provider settings
- [x] Set Site URL to: `http://localhost:3000`
- [x] Added Redirect URL: `http://localhost:3000/auth/callback`

## ✅ Google Cloud Setup (Partial)
- [ ] Created Google Cloud Project at https://console.cloud.google.com
- [ ] Project name: `[GOOGLE_CLOUD_PROJECT_NAME]` (if created)
- ⚠️ **I need help completing the Google OAuth setup** (back-and-forth config between Google Console and Supabase)

## ✅ Local Setup
- [x] Cloned the empty GitHub repo to my local machine
- [x] Created `/setup` directory in the root (for troubleshooting guides)
- [x] Will run `supabase link` command manually (requires password)
- [x] Will run `supabase db push` commands manually

---

# PART 3: Build Me the Baseline

## 🎯 Baseline Goal

Create a **working, deployed website** with:

### Frontend
- ✅ Next.js (App Router) + TypeScript
- ✅ Tailwind CSS v4 with **exact monochrome theme** (black/grey/white OKLCH colors)
- ✅ shadcn/ui components (New York style, neutral base)
- ✅ Geist Sans & Geist Mono fonts
- ✅ Responsive design (mobile + desktop)

### Authentication
- ✅ **Production:** Email + Google OAuth
- ✅ **Local Development:** Email only (no Google OAuth needed)
- ✅ Login & Signup pages with forms
- ✅ Auth middleware protecting routes
- ✅ Automatic profile creation on signup

### Database
- ✅ Profiles table (id, email, created_at, updated_at)
- ✅ Auto-create profile trigger
- ✅ RLS policies (user-scoped)
- ✅ Ready for app-specific tables (I'll add later)

### Homepage
- ✅ **Unauthenticated users:**
  - Header with "Sign In" and "Sign Up" buttons
  - Welcome message: "Welcome to [APP_NAME]"
  - Tagline: "[APP_DESCRIPTION]"
  - 3 CTA cards explaining what to do next:
    1. Sign up to get started
    2. Secure authentication with email or Google
    3. Your data, protected and private

- ✅ **Authenticated users:**
  - Header with user menu (profile, sign out)
  - Welcome message: "Welcome back to [APP_NAME]"
  - Placeholder dashboard:
    - "Your account is set up and ready"
    - "Next: Customize this app for your needs"

### Deployment
- ✅ Deployed to Vercel
- ✅ Environment variables configured
- ✅ Production URL working
- ✅ Auth flow tested (email signup + login)

---

## 🎨 Design System (Use Exact Values)

### Tailwind CSS v4 Color Scheme

**Copy these exact OKLCH values into `globals.css`:**

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

## 📂 Project Structure (Canonical)

```
[APP_NAME]/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router
│   │   │   ├── api/             # API routes (if needed)
│   │   │   ├── (auth)/          # Auth pages group
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   ├── auth/
│   │   │   │   └── callback/route.ts  # OAuth callback
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Homepage
│   │   │   └── globals.css      # Global styles
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── auth/            # Auth forms
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── signup-form.tsx
│   │   │   └── UserMenu.tsx     # User menu component
│   │   ├── lib/                 # Utilities
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts    # Browser client
│   │   │   │   ├── server.ts    # Server client
│   │   │   │   └── middleware.ts # Auth middleware
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── middleware.ts        # Next.js middleware
│   ├── .env.local               # Environment variables (not in git)
│   ├── .gitignore
│   ├── components.json          # shadcn config
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
├── supabase/
│   ├── migrations/
│   │   └── 001_create_profiles.sql
│   ├── functions/               # Edge functions (empty for now)
│   └── config.toml
├── setup/                       # Troubleshooting guides (not in git)
│   └── .gitkeep
├── .gitignore                   # MUST include setup/ and .env.local
└── README.md
```

---

## 🗄️ Database Schema (Baseline)

### Migration: `supabase/migrations/001_create_profiles.sql`

```sql
-- Baseline Migration: User Profiles with Multi-Tenancy
-- Created: [DATE]
-- Description: Creates profiles table with auto-create trigger and RLS

-- ============================================
-- STEP 1: Create profiles table
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 2: Auto-create profile trigger
-- ============================================
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

-- ============================================
-- STEP 3: Comments for documentation
-- ============================================
COMMENT ON TABLE profiles IS 'User profiles, auto-created on signup';
COMMENT ON FUNCTION handle_new_user() IS 'Auto-creates profile when user signs up via email or OAuth';
```

> 💡 **Note:** This is the baseline. App-specific tables will be added later.

---

## 🔐 Google OAuth Setup (Step-by-Step)

> ⚠️ **Important:** You mentioned this is a weak area, so I'll guide you through it completely.

### Before You Start
- You've created a Google Cloud Project (or I'll help you create one)
- Project name: `[GOOGLE_CLOUD_PROJECT_NAME]`

### Step 1: Google Cloud Console Setup

1. **Go to:** https://console.cloud.google.com
2. **Select your project** (or create new: `[GOOGLE_CLOUD_PROJECT_NAME]`)
3. **Navigate to:** APIs & Services → Credentials
4. **Click:** "Create Credentials" → "OAuth 2.0 Client IDs"

### Step 2: Configure OAuth Consent Screen

**If first time:**
1. Click "Configure Consent Screen"
2. Choose **External** (unless you have Google Workspace)
3. Fill in:
   - App name: `[APP_NAME]`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. **Scopes:** Skip (click "Save and Continue")
6. **Test users:** Add your email address (important for testing!)
7. Click "Save and Continue"

### Step 3: Create OAuth Client ID

1. **Application type:** Web application
2. **Name:** `[APP_NAME] - Supabase Auth`
3. **Authorized JavaScript origins:** Leave empty for now
4. **Authorized redirect URIs:** Add this EXACT URL:
   ```
   https://[SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   Replace `[SUPABASE_PROJECT_REF]` with your actual Supabase project ref

5. Click "Create"
6. **Copy these values** (you'll need them):
   - Client ID: `[GOOGLE_CLIENT_ID]`
   - Client Secret: `[GOOGLE_CLIENT_SECRET]`

### Step 4: Configure Supabase

1. **Go to:** Supabase Dashboard → Authentication → Providers
2. **Enable Google provider**
3. **Paste:**
   - Client ID: `[GOOGLE_CLIENT_ID]`
   - Client Secret: `[GOOGLE_CLIENT_SECRET]`
4. **Click "Save"**

### Step 5: Update Supabase URLs (for Production)

When deploying to Vercel, you'll need to update:

1. **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL:** `https://[your-app].vercel.app`
3. **Redirect URLs:** Add:
   - `https://[your-app].vercel.app/auth/callback`
   - Keep `http://localhost:3000/auth/callback` for local dev

### Step 6: Test

1. **Local (Email only):** Test email signup/login
2. **Production (Email + Google):** Test both email and Google OAuth

> ✅ **Done!** Google OAuth is now configured.

---

## 🚀 Build Steps (LLM Will Execute)

### Phase 1: Local Setup

1. **Initialize Git** (if not already)
   ```bash
   git init
   git remote add origin [GITHUB_REPO_URL]
   ```

2. **Create directory structure**
   ```bash
   mkdir -p frontend supabase/migrations supabase/functions setup
   echo "setup/" >> .gitignore
   ```

3. **Create Next.js app**
   ```bash
   cd frontend
   npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```
   - App Router: Yes
   - Turbopack: No (for stability)

4. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install tailwindcss@next @tailwindcss/postcss@next tw-animate-css
   ```

5. **Initialize shadcn/ui**
   ```bash
   npx shadcn@latest init
   ```
   Then install components:
   ```bash
   npx shadcn@latest add button card input label dropdown-menu dialog separator
   ```

### Phase 2: Configure Files

1. **Create `.env.local`** with all environment variables
2. **Configure Tailwind** (v4 CSS-first, remove config file)
3. **Create Supabase clients** (browser, server, middleware)
4. **Create auth forms** (login, signup)
5. **Create homepage** (authenticated vs unauthenticated states)
6. **Create user menu component**

### Phase 3: Database Setup

**I will run these commands manually:**

1. **Link Supabase project:**
   ```bash
   supabase link --project-ref [SUPABASE_PROJECT_REF]
   ```
   *(I'll enter my password)*

2. **Push migration:**
   ```bash
   supabase db push
   ```

### Phase 4: Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial baseline setup"
   git push -u origin main
   ```

2. **Vercel Dashboard:**
   - Import repository
   - Root directory: `frontend/`
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `ANTHROPIC_API_KEY`
     - `OPENAI_API_KEY`
   - Deploy!

3. **Update Supabase URLs** (see Google OAuth Step 5 above)

4. **Test production:**
   - Email signup ✅
   - Email login ✅
   - Google OAuth ✅
   - User menu ✅
   - Sign out ✅

---

## ✅ Success Criteria

The baseline is complete when:

### Frontend
- [ ] Next.js app running on `localhost:3000`
- [ ] Tailwind v4 with exact monochrome colors applied
- [ ] shadcn/ui components installed and working
- [ ] Responsive design (test on mobile + desktop)

### Authentication
- [ ] Email signup works locally
- [ ] Email login works locally
- [ ] Google OAuth works in production
- [ ] Profile auto-created on signup
- [ ] User menu shows email and sign out

### Database
- [ ] `profiles` table exists with RLS
- [ ] Trigger creates profile on signup
- [ ] Can view profile in Supabase dashboard

### Deployment
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production URL accessible
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

### Homepage
- [ ] Unauthenticated: Shows welcome + 3 CTA cards + login/signup buttons
- [ ] Authenticated: Shows welcome back + user menu + placeholder dashboard

---

## 📝 Notes for LLM

### Search for Latest Versions (If Option 1 Selected)
If I didn't specify versions, please:
1. Search for latest **stable** versions of Next.js, React, Tailwind v4, TypeScript
2. Verify they work well together (check compatibility)
3. Use the most stable combination, not absolute bleeding edge
4. Note the versions you chose in your plan

### Structure Your Work
1. **Create a plan** - outline all steps
2. **Create a todo list** - track progress
3. **Build systematically** - follow the canonical structure
4. **Test as you go** - verify auth, styling, deployment
5. **Report completion** - confirm all success criteria met

### Manual Steps (I Will Do)
- Run `supabase link` (requires my password)
- Run `supabase db push` (I'll do this)
- Test the deployed site

### Google OAuth Help
- If I haven't completed Google Cloud setup, guide me through it
- Reference the screenshot I provided (Google Cloud Console dashboard)
- Be very detailed with the back-and-forth between Google Console and Supabase

### After Baseline is Complete
Once deployed and working:
- I'll customize the homepage for my specific app
- I'll add app-specific database tables
- I'll add app-specific features
- The baseline gives me a solid foundation to build on

---

## 🎯 Final Deliverable

When you're done, I should have:

1. ✅ **Live website** at Vercel URL
2. ✅ **Working authentication** (email + Google OAuth)
3. ✅ **Clean codebase** synced with GitHub
4. ✅ **Monochrome design** matching the Prompt Library style
5. ✅ **Multi-tenant database** ready for app-specific tables
6. ✅ **Placeholder homepage** ready to customize
7. ✅ **All environment variables** configured

---

**Template Version:** 2.0.0 (Baseline-Focused)
**Last Updated:** January 2025
**Compatible With:** Next.js 15+, Tailwind v4, Supabase, shadcn/ui
