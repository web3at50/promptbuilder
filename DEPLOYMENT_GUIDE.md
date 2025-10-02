# Deployment Guide - Prompt Library

This guide walks you through deploying your Prompt Library application to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Supabase project created and configured
- ✅ Database migrations run successfully (`supabase db push`)
- ✅ Email authentication enabled in Supabase
- ✅ Google OAuth configured (optional but recommended)
- ✅ Anthropic API key ready
- ✅ GitHub repository with latest code pushed
- ✅ Vercel account created

---

## 🔧 Step 1: Run Database Migrations

Make sure all migrations are applied to your Supabase database:

```bash
cd c:\Users\bryn\Documents\promptbuilder
supabase db push
```

**Verify migrations were successful:**
1. Go to Supabase Dashboard → Table Editor
2. Check that these tables exist:
   - `prompts` (with `user_id` column)
   - `profiles`
   - `optimization_usage`

3. Go to Supabase Dashboard → Database → Policies
4. Verify RLS policies are active on all tables

---

## 🔐 Step 2: Configure Supabase Authentication

### Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. **Enable "Confirm email"** ✓ (recommended for production)
4. Configure email templates (optional):
   - Confirm signup template
   - Reset password template
   - Add your branding/styling

### Configure Google OAuth

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Prompt Library"

2. **Add Authorized Redirect URIs:**
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
   Replace `[your-project-ref]` with your actual Supabase project reference

3. **Copy Credentials:**
   - Copy Client ID
   - Copy Client Secret

4. **Configure in Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Find "Google" and click to expand
   - Enable Google provider
   - Paste Client ID
   - Paste Client Secret
   - Save

5. **Test OAuth Flow:**
   - Try signing in with Google in local development first
   - Ensure redirect works properly

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository: `web3at50/promptbuilder`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

   **Where to find these values:**
   - **Supabase URL & Anon Key**: Supabase Dashboard → Settings → API
   - **Anthropic API Key**: [Anthropic Console](https://console.anthropic.com/)

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)
   - Vercel will provide a URL: `https://your-app.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd c:\Users\bryn\Documents\promptbuilder

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

---

## ✅ Step 4: Post-Deployment Configuration

### Update OAuth Redirect URLs

Now that you have your production URL, update OAuth settings:

1. **Supabase:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL": `https://your-app.vercel.app`
   - Add to "Redirect URLs": `https://your-app.vercel.app/auth/callback`

2. **Google OAuth:**
   - Go back to Google Cloud Console
   - Edit your OAuth 2.0 Client ID
   - Add authorized redirect URI:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
   - Add authorized JavaScript origin:
     ```
     https://your-app.vercel.app
     ```

---

## 🧪 Step 5: Test Production Deployment

### Test Authentication Flows

1. **Email Sign-Up:**
   - Go to `https://your-app.vercel.app/signup`
   - Create a test account
   - Check email for verification link
   - Click link and verify account
   - Sign in successfully

2. **Google OAuth:**
   - Go to `/login`
   - Click "Continue with Google"
   - Authenticate with Google
   - Verify redirect back to app
   - Confirm you're signed in

3. **Password Reset:**
   - Go to `/reset-password`
   - Enter email
   - Check for reset email
   - Click link and set new password

### Test Application Features

1. **Create Prompt:**
   - Create a new prompt with title, content, tags
   - Save successfully

2. **Optimize Prompt:**
   - Edit a prompt
   - Click "Optimize with Claude"
   - Verify optimization works

3. **View Profile:**
   - Go to `/profile`
   - Check stats are displaying correctly
   - Verify prompt count and optimization count

4. **Multi-Tenancy:**
   - Create second test account
   - Create prompts in second account
   - Verify accounts can't see each other's prompts
   - Sign out and sign in to different accounts

### Test Demo Mode (Unauthenticated)

1. **Open Incognito Window:**
   - Clear browser data or use incognito
   - Go to your app URL
   - You should be redirected to `/login`

2. **Test Demo Flow (if implemented):**
   - Access public pages
   - Try optimization without account
   - Verify signup prompt after limit

---

## 🔄 Step 6: Continuous Deployment

Vercel automatically deploys on every push to `main` branch.

**Workflow:**
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys in ~2 minutes
```

**View Deployment:**
- Vercel Dashboard shows deployment status
- Click deployment to see build logs
- Preview deployments available for branches

---

## 📊 Step 7: Monitor & Maintain

### Supabase Monitoring

1. **Database Usage:**
   - Supabase Dashboard → Reports
   - Monitor database size
   - Check query performance

2. **Auth Analytics:**
   - Authentication → Users
   - View sign-up trends
   - Monitor active users

### Anthropic API Usage

1. **Monitor Costs:**
   - [Anthropic Console](https://console.anthropic.com/) → Usage
   - Track API calls
   - Set up billing alerts

2. **Rate Limiting (Future):**
   - Implement user quotas if needed
   - Add Stripe for billing

### Vercel Analytics

1. **View Performance:**
   - Vercel Dashboard → Analytics
   - Monitor page load times
   - Check function execution times

---

## 🚨 Troubleshooting

### Build Fails on Vercel

**Error**: "Module not found" or dependency issues
- **Fix**: Ensure `package.json` is in `frontend/` directory
- **Fix**: Check `node_modules` is in `.gitignore`
- **Fix**: Verify root directory is set to `frontend` in Vercel

**Error**: "Invalid Supabase URL"
- **Fix**: Check environment variables are set in Vercel
- **Fix**: Ensure no trailing slashes in URLs

### Authentication Not Working

**Error**: "Invalid redirect URI"
- **Fix**: Add your Vercel URL to Supabase redirect URLs
- **Fix**: Add Supabase callback URL to Google OAuth settings

**Error**: Email verification not sending
- **Fix**: Check Supabase → Authentication → Email Templates
- **Fix**: Verify email provider is configured

### Database Errors

**Error**: "RLS policy violation"
- **Fix**: Verify migrations ran successfully
- **Fix**: Check policies exist in Supabase Dashboard → Database → Policies

**Error**: "user_id column does not exist"
- **Fix**: Run migration 002 (`supabase db push`)
- **Fix**: Check migration was applied in Supabase → Migrations

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Users can sign up with email/password
- ✅ Email verification works
- ✅ Google OAuth sign-in works
- ✅ Users can create and save prompts
- ✅ AI optimization works
- ✅ Profile page shows correct stats
- ✅ Users can't see each other's prompts
- ✅ Sign out redirects to login
- ✅ Password reset flow works

---

## 📝 Next Steps

**Optional Enhancements:**

1. **Custom Domain:**
   - Buy domain (e.g., `promptlibrary.com`)
   - Add to Vercel: Vercel Dashboard → Settings → Domains
   - Update OAuth redirect URLs

2. **Analytics:**
   - Add Vercel Analytics
   - Add PostHog or similar for user tracking
   - Monitor conversion rates (demo → signup)

3. **Monitoring:**
   - Add Sentry for error tracking
   - Set up uptime monitoring
   - Create alerts for API failures

4. **Stripe Integration:**
   - See `/setup/AUTH_IMPLEMENTATION_PLAN.md` for future monetization

---

## 🆘 Getting Help

**Resources:**
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

**Common Issues:**
- Check Vercel build logs for errors
- Check browser console for client-side errors
- Check Supabase logs in Dashboard → Logs

---

**Congratulations! Your Prompt Library is now live! 🚀**
