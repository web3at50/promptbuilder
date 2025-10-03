# Google OAuth Setup Guide - Google Workspace Edition

**Date:** October 3, 2025
**Project:** Prompt Library
**Environment:** Google Workspace Account
**Goal:** Enable "Sign in with Google" for production deployment

---

## 🎯 What You'll Accomplish

By the end of this guide, users will be able to:
- Sign in to your app with their Google account
- Have their profile automatically created in your database
- Use Google authentication alongside email/password auth

---

## 📋 Prerequisites

Before starting:
- ✅ Supabase project configured with authentication
- ✅ Email authentication working (optional but recommended)
- ✅ App deployed to production (Vercel, Netlify, etc.)
- ✅ Production URL ready (e.g., `https://your-app.vercel.app`)
- ✅ Google Workspace account (or personal Gmail account)

---

## 🔧 Part 1: Google Cloud Console Setup

### **Step 1: Access Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google Workspace account
3. You'll see the Google Cloud dashboard

---

### **Step 2: Create a New Project**

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Enter project details:
   - **Project name:** `Prompt Builder` (or your app name)
   - **Organization:** Your Google Workspace domain will auto-populate
   - **Location:** Keep default or select your organization
4. Click **"Create"**
5. Wait ~10 seconds for project creation
6. **Select your new project** from the dropdown to make it active

**Screenshot reference:** You should see "prompt builder app" at the top left

---

### **Step 3: Navigate to OAuth & Auth Platform**

1. In the left sidebar (hamburger menu ☰), click **"Google Auth Platform"**
2. You'll see several tabs:
   - Overview
   - Branding
   - Audience
   - Clients
   - Data access
   - Verification centre

---

### **Step 4: Configure Branding**

Click on the **"Branding"** tab.

**Fill in the following fields:**

| Field | Value | Notes |
|-------|-------|-------|
| **App name** | `Prompt Builder` | This appears on the Google sign-in screen |
| **User support email** | `admin@yourdomain.xyz` | Your Workspace email (dropdown) |
| **App domain** | `https://promptbuilder-liard.vercel.app` | Your production URL |
| **Application privacy policy link** | Leave blank | Optional - add later |
| **Application Terms of Service link** | Leave blank | Optional - add later |
| **Authorized domains** | `promptbuilder-liard.vercel.app` | Just the domain, no https:// |

**Notes:**
- Don't use `localhost` in production settings
- The app name shows on the consent screen: "Sign in to continue to **Prompt Builder**"
- Authorized domains must match your production URL

Click **"Save"** at the bottom.

---

### **Step 5: Configure Audience**

Click on the **"Audience"** tab.

**Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Publishing status** | `Testing` | Start with Testing, publish later |
| **User type** | `External` | For Google Workspace, use External |
| **OAuth user cap** | `100 users` | Default for Testing mode |

**Add Test Users:**

1. Click **"+ Add users"** under "Test users"
2. Add email addresses of people who should test:
   - Your own email
   - Team members
   - Beta testers
3. Click **"Add"**

**Important:**
- While in "Testing" mode, ONLY test users can sign in
- To allow anyone to sign in, click **"Publish app"** later
- Google Workspace accounts have higher limits than personal Gmail

Click **"Save"**.

---

### **Step 6: Configure Data Access (Scopes)**

Click on the **"Data access"** tab.

**Add OAuth Scopes:**

1. Click **"Add or remove scopes"**
2. You'll see a list of available scopes
3. Select these **2 scopes** (essential for authentication):

| Scope | Description | Required |
|-------|-------------|----------|
| `.../auth/userinfo.email` | See user's email address | ✅ Yes |
| `.../auth/userinfo.profile` | See user's basic profile info | ✅ Yes |

4. Click **"Update"**
5. Click **"Save"**

**Why these scopes?**
- `userinfo.email` - Needed to create user profile in your database
- `userinfo.profile` - Gets user's name and profile picture

**Note:** These are non-sensitive scopes and don't require verification.

---

### **Step 7: Create OAuth 2.0 Client Credentials**

Click on the **"Clients"** tab.

1. You should see: **"No OAuth clients to display"**
2. Click **"+ Create client"** at the top
3. Select **"Web application"** as the application type
4. Click **"Create"**

**Configure the OAuth Client:**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `Prompt Builder - Production` | Descriptive name for your records |

**Authorized JavaScript origins:**

Click **"+ Add URI"** and add these **2 URIs**:

1. `https://promptbuilder-liard.vercel.app` ← Your production URL
2. `https://awhrudcamngnsoigqzzx.supabase.co` ← Your Supabase project URL

**Authorized redirect URIs:**

Click **"+ Add URI"** and add this **1 URI**:

1. `https://awhrudcamngnsoigqzzx.supabase.co/auth/v1/callback` ← Supabase auth callback

**Important Notes:**
- The redirect URI ALWAYS points to Supabase (never to your app directly)
- Don't include `http://localhost:3000` in production OAuth clients (create a separate one for local dev)
- Make sure there are no trailing slashes
- URLs are case-sensitive

5. Click **"Create"**

---

### **Step 8: Copy Your OAuth Credentials**

After creating the client, you'll see a confirmation with:

**Client ID:**
```
875801037059-5vg0alabr3iannngm3k5460khrsl0sdk.apps.googleusercontent.com
```

**Client Secret:**
```
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
```

**⚠️ IMPORTANT:**
- Copy BOTH values to a safe place (password manager, secure note)
- The Client Secret is shown ONLY ONCE
- You'll need both for Supabase configuration
- Keep the Client Secret private (never commit to git)

You can always view these later by clicking on the client in the Clients tab.

---

### **Step 9: Verification Centre (Optional)**

Click on the **"Verification centre"** tab.

You should see:
- **Verification status:** "Verification not required"
- **Publishing status:** "Testing"

**What this means:**
- Your app doesn't need Google verification while in Testing mode
- Users will see "This app hasn't been verified by Google" warning
- To remove the warning, you need to publish and verify (for production)

**For now:** Leave this as-is. You can publish later when ready for public use.

---

## 🔧 Part 2: Supabase Configuration

### **Step 10: Configure Google Provider in Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"Authentication"** → **"Providers"** in left sidebar
4. Scroll down and find **"Google"** in the providers list
5. Click on **"Google"** to expand the configuration

**Fill in the form:**

| Field | Value |
|-------|-------|
| **Enable Google provider** | Toggle to **ON** (green) |
| **Client ID (for OAuth)** | Paste your Client ID from Step 8 |
| **Client Secret (for OAuth)** | Paste your Client Secret from Step 8 |

6. Click **"Save"** at the bottom

---

### **Step 11: Verify Supabase URL Configuration**

While in Supabase Dashboard:

1. Go to **"Authentication"** → **"URL Configuration"**
2. Verify these settings:

| Setting | Value |
|---------|-------|
| **Site URL** | `https://promptbuilder-liard.vercel.app` |

**Redirect URLs** should include:
- `https://promptbuilder-liard.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback` (for local dev)

3. If not set correctly, update and click **"Save"**

---

## ✅ Part 3: Testing

### **Step 12: Test Google OAuth**

**Use Incognito/Private Mode** (important for fresh test):

1. Open an **incognito/private browser window**
2. Go to your production URL: `https://promptbuilder-liard.vercel.app/login`
3. Click **"Continue with Google"** button
4. You'll be redirected to Google's sign-in page

**What you should see:**
- Google sign-in screen
- Text: "Sign in to continue to **Prompt Builder**" (your app name)
- Warning: "This app hasn't been verified by Google" (normal for Testing mode)
- Button: "Continue" or "Go to Prompt Builder (unsafe)"

5. Click **"Continue"** to proceed
6. Select your Google account
7. Review permissions:
   - See your email address
   - See your basic profile info
8. Click **"Continue"** to grant permissions
9. You should be redirected back to your app
10. Check that you're signed in (see your profile in the header)

---

### **Step 13: Verify Profile Creation**

Check that Google sign-in created your profile:

1. In Supabase Dashboard → **"Authentication"** → **"Users"**
2. You should see your new user with:
   - Email from Google
   - Provider: `google`
   - Created timestamp

3. Go to **"Table Editor"** → **"profiles"** table
4. Verify your profile exists with:
   - ID matching auth.users.id
   - Email from Google
   - Created timestamp

✅ If you see your profile, Google OAuth is working!

---

### **Step 14: Test Multi-Tenancy**

Verify users can't see each other's data:

1. While signed in with Google account A:
   - Create a test prompt: "Google User A Prompt"

2. Sign out

3. In a new incognito window:
   - Sign in with a different Google account (Google account B)
   - Verify you DON'T see "Google User A Prompt"
   - Create a new prompt: "Google User B Prompt"

4. Sign out and sign back in with account A

5. Verify you DON'T see "Google User B Prompt"

✅ If users can't see each other's prompts, multi-tenancy is working!

---

## 🔄 Part 4: Publishing (Optional - For Production)

### **When to Publish Your App**

Publish when you're ready for:
- Anyone with a Google account to sign in (not just test users)
- Removing the "unverified app" warning
- Public launch

### **How to Publish**

1. Go to Google Cloud Console → **"Audience"** tab
2. Click **"Publish app"**
3. Click **"Confirm"**

**After publishing:**
- Anyone can sign in with Google
- User cap increases significantly
- You may need to submit for verification if using sensitive scopes

**Verification Process:**
- For basic scopes (email, profile): No verification needed
- For sensitive scopes: Submit app for Google review
- Review can take 1-2 weeks

---

## 🚨 Troubleshooting

### **Error: "redirect_uri_mismatch"**

**Cause:** The redirect URI in your request doesn't match Google Cloud Console.

**Fix:**
1. Go to Google Cloud Console → **"Clients"** tab
2. Click on your OAuth client
3. Check **"Authorized redirect URIs"** includes:
   ```
   https://[your-supabase-project].supabase.co/auth/v1/callback
   ```
4. Make sure there are no typos or trailing slashes
5. Click **"Save"**
6. Wait 5 minutes for changes to propagate
7. Try again

---

### **Error: "Access blocked: This app's request is invalid"**

**Cause:** OAuth consent screen not fully configured.

**Fix:**
1. Go to **"Branding"** tab
2. Ensure all required fields are filled:
   - App name
   - User support email
   - App domain
   - Authorized domains
3. Go to **"Data access"** tab
4. Verify scopes include `userinfo.email` and `userinfo.profile`
5. Click **"Save"**

---

### **Error: "User not allowed to sign in"**

**Cause:** User not in test users list (while in Testing mode).

**Fix:**
1. Go to **"Audience"** tab
2. Under **"Test users"**, click **"+ Add users"**
3. Add the user's email address
4. Click **"Add"**
5. User can now sign in

**Alternative:** Publish the app to allow anyone to sign in.

---

### **Google Sign-In Button Does Nothing**

**Check:**
1. Browser console for JavaScript errors (F12 → Console)
2. Supabase Provider settings:
   - Google provider is enabled (green toggle)
   - Client ID is correct
   - Client Secret is correct
3. Network tab (F12 → Network):
   - Look for failed requests
   - Check for CORS errors

---

### **Sign-In Works But Profile Not Created**

**Cause:** Database trigger or RLS policy issue.

**Fix:**
1. Check Supabase logs: **"Database"** → **"Logs"**
2. Look for errors related to `profiles` table
3. Verify RLS policies allow INSERT:
   ```sql
   CREATE POLICY "Users can insert their own profile"
     ON profiles FOR INSERT
     WITH CHECK (auth.uid() = id);
   ```
4. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

---

## 📊 Differences: Google Workspace vs Personal Gmail

| Feature | Google Workspace | Personal Gmail |
|---------|------------------|----------------|
| **User type** | External (most common) | External |
| **Testing mode user limit** | 100 users | 100 users |
| **Organization** | Shows your domain | None |
| **Branding** | Can use company branding | Personal only |
| **Admin controls** | Workspace admin can restrict OAuth apps | N/A |
| **Verification** | Same process | Same process |

**Key Difference:**
- Workspace accounts may have organizational policies restricting OAuth apps
- Check with your Workspace admin if sign-in is blocked

---

## 📝 Summary Checklist

### **Google Cloud Console:**
- [x] Project created
- [x] Branding configured (app name, domain, email)
- [x] Audience set to External with test users
- [x] Scopes added (userinfo.email, userinfo.profile)
- [x] OAuth client created (Web application)
- [x] Authorized JavaScript origins set
- [x] Authorized redirect URIs set to Supabase callback
- [x] Client ID and Secret copied

### **Supabase:**
- [x] Google provider enabled
- [x] Client ID pasted
- [x] Client Secret pasted
- [x] Site URL set to production URL
- [x] Redirect URLs include production callback
- [x] Changes saved

### **Testing:**
- [x] Google sign-in works in production
- [x] Profile created in database
- [x] Multi-tenancy verified
- [x] No errors in console

---

## 🎉 Success!

You now have Google OAuth working! Users can sign in with:
- ✅ Email & Password
- ✅ Google Account

Both methods create the same profile structure and work identically in your app.

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

## 💡 Tips for Future Projects

1. **Create separate OAuth clients** for development and production
2. **Use environment variables** for Client ID/Secret (never commit to git)
3. **Start in Testing mode**, publish when ready for launch
4. **Test with multiple Google accounts** to verify multi-tenancy
5. **Monitor usage** in Google Cloud Console → Metrics
6. **Set up billing alerts** if using paid Google Cloud features
7. **Document your scopes** so you remember why you requested them
8. **Keep Client Secrets secure** - rotate if exposed

---

**Created:** October 3, 2025
**Last Updated:** October 3, 2025
**Status:** ✅ Production Ready
