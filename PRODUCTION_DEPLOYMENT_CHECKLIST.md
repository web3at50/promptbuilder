# Production Deployment Checklist

**Project:** Prompt Library
**Date:** October 3, 2025
**Goal:** Deploy to production with working authentication (Email + Google OAuth)

---

## 📋 Overview

This checklist ensures your authentication works in production exactly as it does locally.

**What's already working locally:**
- ✅ Email/password signup and login
- ✅ Email confirmation (if enabled)
- ✅ Google OAuth (once you set it up)
- ✅ User profiles
- ✅ Protected routes

**What you need to do for production:**
- Update URLs in Google Cloud Console
- Update URLs in Supabase
- Deploy to Vercel
- Test everything in production

---

## 🚀 Part 1: Deploy to Vercel

### **Step 1: Push Your Code to GitHub**

Your code is already on GitHub at: `web3at50/promptbuilder`

Make sure all latest changes are pushed:

```bash
cd C:\Users\bryn\Documents\promptbuilder
git add .
git commit -m "Fix auth setup - ready for production"
git push origin main
```

---

### **Step 2: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose `web3at50/promptbuilder`
5. Click **"Import"**

**Configure the project:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `frontend` ⚠️ **IMPORTANT** |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

---

### **Step 3: Add Environment Variables**

Click **"Environment Variables"** and add these **3 variables**:

| Name | Value | Where to Find It |
|------|-------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://awhrudcamngnsoigqzzx.supabase.co` | Already in your `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your key) | Already in your `.env.local` |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (your key) | Already in your `.env.local` |

**⚠️ Make sure to add them to "Production" environment!**

---

### **Step 4: Deploy**

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Vercel will give you a URL like: `https://promptbuilder.vercel.app`
4. Copy this URL - you'll need it!

---

## 🔧 Part 2: Update Google OAuth for Production

### **Step 5: Add Production URL to Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `Prompt Library`
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click on your **OAuth 2.0 Client ID**

**Add your production URL:**

Under **"Authorized JavaScript origins"**:
- Click **"+ Add URI"**
- Add your Vercel URL: `https://promptbuilder.vercel.app` (replace with your actual URL)

**Redirect URI stays the same** (still points to Supabase):
- ✅ Keep: `https://awhrudcamngnsoigqzzx.supabase.co/auth/v1/callback`

5. Click **"Save"**

---

## 🔧 Part 3: Update Supabase Configuration

### **Step 6: Update Site URL in Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/awhrudcamngnsoigqzzx)
2. Click **"Authentication"** → **"URL Configuration"**

**Update these settings:**

| Setting | Value |
|---------|-------|
| **Site URL** | `https://promptbuilder.vercel.app` (your Vercel URL) |

**Add to Redirect URLs:**
- Click **"Add URL"**
- Add: `https://promptbuilder.vercel.app/auth/callback`
- **Keep the localhost URLs** for local development:
  - `http://localhost:3000/auth/callback` ✅ Keep this

3. Click **"Save"**

---

### **Step 7: Update Email Templates (Optional but Recommended)**

If you have email confirmation enabled:

1. Go to **"Authentication"** → **"Email Templates"**
2. Click on **"Confirm signup"** template
3. Update the template to use production URL instead of localhost
4. Look for: `{{ .ConfirmationURL }}`
5. Make sure it points to your production domain
6. Click **"Save"**

Do the same for:
- **"Reset Password"** template
- **"Magic Link"** template (if using)

---

## ✅ Part 4: Test Production Deployment

### **Step 8: Test Email Authentication**

1. Go to your production URL: `https://promptbuilder.vercel.app`
2. Click **"Sign up"**
3. Enter a NEW email (not one you used locally)
4. Create an account
5. If email confirmation is enabled:
   - Check your email
   - Click the verification link
   - Make sure it redirects to production URL (not localhost)
6. Sign in with the new account
7. Create a test prompt
8. Go to `/profile` and check stats

---

### **Step 9: Test Google OAuth**

1. Open an incognito window
2. Go to: `https://promptbuilder.vercel.app/login`
3. Click **"Continue with Google"**
4. Sign in with a different Google account (not the one you tested locally)
5. Grant permissions
6. Should redirect to production app
7. Check that profile was created
8. Create a test prompt
9. Sign out and sign back in

---

### **Step 10: Test Multi-Tenancy**

1. Sign in with **email account** from Step 8
2. Create a prompt: "Test prompt 1"
3. Sign out
4. Sign in with **Google account** from Step 9
5. Verify you DON'T see "Test prompt 1"
6. Create a prompt: "Test prompt 2"
7. Sign out
8. Sign back in with **email account**
9. Verify you DON'T see "Test prompt 2"
10. Verify you still see "Test prompt 1"

✅ If you can't see each other's prompts, multi-tenancy is working!

---

## 🔒 Part 5: Security & Best Practices

### **Step 11: Verify RLS Policies**

1. Go to Supabase Dashboard → **"Database"** → **"Policies"**
2. Check these tables have RLS enabled:
   - ✅ `prompts`
   - ✅ `profiles`
   - ✅ `optimization_usage`
3. Each table should have policies for:
   - SELECT
   - INSERT
   - UPDATE
   - DELETE

---

### **Step 12: Check API Routes Are Protected**

Test that API routes require authentication:

1. Open browser DevTools (F12)
2. Sign out of your app
3. Try to make a request to: `https://promptbuilder.vercel.app/api/prompts`
4. Should return 401 Unauthorized or redirect to login

---

### **Step 13: Review Environment Variables**

In Vercel Dashboard:

1. Go to your project → **"Settings"** → **"Environment Variables"**
2. Verify all 3 variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
3. Make sure there are no extra spaces or line breaks

---

## 📊 Part 6: Monitor & Maintain

### **Step 14: Set Up Monitoring (Optional)**

**Vercel Analytics:**
1. Go to Vercel project → **"Analytics"**
2. Enable Vercel Analytics (free tier available)
3. Monitor page views, performance

**Supabase Dashboard:**
1. **"Database"** → **"Reports"** - Monitor database usage
2. **"Authentication"** → **"Users"** - See new signups
3. **"Logs"** → Filter by service to debug issues

**Anthropic Console:**
1. [console.anthropic.com](https://console.anthropic.com/)
2. **"Usage"** - Monitor API calls
3. Set up billing alerts

---

### **Step 15: Plan for Scaling**

As your app grows, consider:

**Database:**
- Monitor database size in Supabase Reports
- Upgrade Supabase plan if needed (free tier = 500MB)
- Add database indexes for performance

**API Rate Limits:**
- Implement rate limiting per user
- Add usage quotas (e.g., 10 optimizations/day for free users)
- Consider Stripe for paid tiers

**Email Sending:**
- Supabase free tier: 2 emails per hour
- Upgrade or use custom SMTP (SendGrid, Mailgun)

**Costs:**
- **Supabase Free Tier**: 500MB DB, 50MB file storage, 2 emails/hour
- **Vercel Free Tier**: 100GB bandwidth, 100 hours build time
- **Anthropic**: Pay per API call (~$0.003 per 1k tokens)

---

## ✅ Production Deployment Checklist

### **Pre-Deployment**
- [x] Code pushed to GitHub
- [x] All migrations applied locally
- [x] Authentication working locally
- [x] Google OAuth tested locally

### **Vercel Setup**
- [ ] Project deployed to Vercel
- [ ] Root directory set to `frontend`
- [ ] 3 environment variables added
- [ ] Build successful
- [ ] Production URL obtained

### **Google Cloud Console**
- [ ] Production URL added to Authorized JavaScript origins
- [ ] Redirect URI confirmed (points to Supabase)
- [ ] Changes saved

### **Supabase Configuration**
- [ ] Site URL updated to production URL
- [ ] Redirect URLs include production `/auth/callback`
- [ ] Localhost URLs kept for local development
- [ ] Email templates updated (if using email confirmation)
- [ ] RLS policies verified

### **Testing**
- [ ] Email signup works in production
- [ ] Email confirmation works (if enabled)
- [ ] Google OAuth works in production
- [ ] Profile creation works for both auth methods
- [ ] Multi-tenancy verified (users can't see each other's data)
- [ ] Protected routes redirect to login
- [ ] AI optimization works
- [ ] Profile page shows correct stats

### **Security**
- [ ] RLS enabled on all tables
- [ ] API routes require authentication
- [ ] Environment variables secure (not in git)
- [ ] No console errors in production

### **Monitoring**
- [ ] Supabase user count tracking
- [ ] Vercel analytics enabled (optional)
- [ ] Anthropic API usage monitoring

---

## 🎉 Success!

If all items are checked, your app is live with:
- ✅ Secure authentication (email + Google)
- ✅ Multi-tenant architecture
- ✅ Protected routes and API
- ✅ User profiles
- ✅ AI prompt optimization

---

## 🚨 Common Production Issues

### **Issue: "Network Error" on Signup**

**Check:**
- Environment variables in Vercel
- Supabase URL is correct (no trailing slash)
- API key is correct (copy from Supabase Dashboard)

**Fix:**
- Vercel → Settings → Environment Variables → Edit

---

### **Issue: Google OAuth Redirect to Localhost**

**Check:**
- Supabase Site URL (should be production, not localhost)
- Redirect URLs include production domain

**Fix:**
- Supabase → Authentication → URL Configuration

---

### **Issue: Email Links Go to Localhost**

**Check:**
- Email templates in Supabase
- Site URL in Supabase

**Fix:**
- Supabase → Authentication → Email Templates
- Update `{{ .ConfirmationURL }}` template

---

### **Issue: "Database Error Saving New User" in Production**

**Check:**
- Migrations applied to production database
- RLS policies exist

**Fix:**
```bash
# Make sure you're connected to production Supabase project
supabase db push
```

---

## 📞 Support

**If you get stuck:**

1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard → Logs)
3. Check browser console for errors
4. Review this checklist step by step

**Useful Commands:**

```bash
# View Vercel deployment logs
vercel logs <deployment-url>

# Check Supabase migrations
supabase db push --dry-run

# Check git status
git status
```

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**You're ready to go live! 🚀**
