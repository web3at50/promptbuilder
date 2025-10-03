# Google OAuth Setup Guide

**Project:** Prompt Library
**Date:** October 3, 2025
**Goal:** Enable "Sign in with Google" for both local development and production

---

## 📋 Prerequisites

- ✅ Email authentication working (you've already done this!)
- ✅ Supabase project configured
- ✅ Google account (any Gmail account works)

---

## 🔧 Part 1: Google Cloud Console Setup

### **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top (next to "Google Cloud")
4. Click **"New Project"**
5. Enter project name: `Prompt Library` (or whatever you prefer)
6. Click **"Create"**
7. Wait for the project to be created (~10 seconds)
8. Make sure your new project is selected in the dropdown

---

### **Step 2: Enable Google+ API (Required for OAuth)**

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for: `Google+ API`
3. Click on **"Google+ API"**
4. Click **"Enable"**
5. Wait for it to enable (~5 seconds)

---

### **Step 3: Configure OAuth Consent Screen**

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**

**Fill in the form:**

| Field | Value |
|-------|-------|
| **App name** | `Prompt Library` |
| **User support email** | Your email address (select from dropdown) |
| **App logo** | Skip for now (optional) |
| **Application home page** | `http://localhost:3000` (for now) |
| **Authorized domains** | Leave empty for now |
| **Developer contact email** | Your email address |

4. Click **"Save and Continue"**
5. **Scopes page**: Click "Add or Remove Scopes"
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Click **"Update"**
   - Click **"Save and Continue"**
6. **Test users page**:
   - Click **"Add Users"**
   - Add your Gmail address
   - Click **"Add"**
   - Click **"Save and Continue"**
7. **Summary page**: Click **"Back to Dashboard"**

---

### **Step 4: Create OAuth 2.0 Credentials**

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** at the top
3. Select **"OAuth 2.0 Client ID"**
4. If prompted to configure consent screen, you've already done it (go back to Step 3)

**Fill in the form:**

| Field | Value |
|-------|-------|
| **Application type** | Web application |
| **Name** | `Prompt Library - Local & Production` |

**Authorized JavaScript origins:**
- Click **"+ Add URI"**
- Add: `http://localhost:3000`
- Click **"+ Add URI"** again
- Add: `https://awhrudcamngnsoigqzzx.supabase.co`

**Authorized redirect URIs:**
- Click **"+ Add URI"**
- Add: `https://awhrudcamngnsoigqzzx.supabase.co/auth/v1/callback`

5. Click **"Create"**

---

### **Step 5: Save Your Credentials**

A popup will appear with your credentials:

- **Client ID**: Looks like `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-abc123xyz`

**⚠️ IMPORTANT:**
- Copy both values to a safe place (Notepad, password manager, etc.)
- You'll need these in the next step
- Click **"OK"** to close the popup

---

## 🔧 Part 2: Configure Supabase

### **Step 6: Add Google Provider to Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/awhrudcamngnsoigqzzx)
2. Click **"Authentication"** → **"Providers"** in the left sidebar
3. Scroll down and find **"Google"** in the list
4. Click on **"Google"** to expand it

**Fill in the form:**

| Field | Value |
|-------|-------|
| **Enable Google provider** | Toggle to **ON** (green) |
| **Client ID (for OAuth)** | Paste your Client ID from Step 5 |
| **Client Secret (for OAuth)** | Paste your Client Secret from Step 5 |

5. Click **"Save"** at the bottom

---

## ✅ Part 3: Test Google OAuth Locally

### **Step 7: Test the Integration**

1. Make sure your dev server is running:
   ```bash
   cd C:\Users\bryn\Documents\promptbuilder\frontend
   npm run dev
   ```

2. Open your browser to: `http://localhost:3000/login`

3. Click **"Continue with Google"**

4. You should see a Google sign-in popup

5. Select your Google account

6. Click **"Continue"** to grant permissions

7. You should be redirected back to your app and signed in!

8. Go to `/profile` to see your account details

---

### **Step 8: Verify Profile Was Created**

Check that your Google account created a profile in the database:

1. Go to Supabase Dashboard → **"Table Editor"**
2. Click on the **"profiles"** table
3. You should see your profile with:
   - Email from Google
   - Created timestamp

---

## 🚨 Troubleshooting

### **Error: "redirect_uri_mismatch"**

**Cause:** The redirect URI in Google Cloud doesn't match Supabase

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Make sure Authorized redirect URIs includes:
   ```
   https://awhrudcamngnsoigqzzx.supabase.co/auth/v1/callback
   ```
4. Save and try again

---

### **Error: "Access blocked: This app's request is invalid"**

**Cause:** OAuth consent screen not configured or scopes missing

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure status is "Testing" or "Published"
3. Add yourself as a test user
4. Make sure scopes include `userinfo.email` and `userinfo.profile`

---

### **Google Sign-In Button Not Working**

**Check:**
1. Browser console for JavaScript errors
2. Google Provider is enabled in Supabase
3. Client ID and Secret are correct in Supabase
4. No typos in the redirect URI

---

## 🌐 Part 4: Production Setup (After Deployment)

When you deploy to Vercel or another host, you'll need to update:

### **In Google Cloud Console:**

1. Go to **Credentials** → Your OAuth Client
2. **Add your production URL** to Authorized JavaScript origins:
   ```
   https://your-app.vercel.app
   ```
3. The redirect URI stays the same (always points to Supabase)
4. Click **"Save"**

### **In Supabase Dashboard:**

1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL** to your production URL:
   ```
   https://your-app.vercel.app
   ```
3. Make sure **Redirect URLs** includes:
   ```
   https://your-app.vercel.app/auth/callback
   ```
4. Click **"Save"**

### **In OAuth Consent Screen (Optional but Recommended):**

1. Update **Application home page** to production URL
2. Add **Authorized domains** (e.g., `vercel.app`)
3. If you want anyone to sign in (not just test users):
   - Click **"Publish App"**
   - Submit for verification (if needed)

---

## 📝 Important Notes

### **Development vs Production**

- **Development**:
  - Uses `http://localhost:3000`
  - Only you (test user) can sign in
  - OAuth consent screen shows "This app isn't verified"

- **Production**:
  - Uses `https://your-app.vercel.app`
  - Can publish app for anyone to use
  - Should verify app for production (removes warning)

### **Security**

- ✅ Client ID is safe to expose (it's public)
- ⚠️ Client Secret must stay secret (never commit to git)
- ✅ Supabase stores the secret securely
- ✅ Redirect URI validation prevents attacks

### **OAuth Flow**

1. User clicks "Sign in with Google"
2. Redirects to Google login
3. User grants permissions
4. Google redirects to: `https://[supabase].supabase.co/auth/v1/callback`
5. Supabase exchanges code for user info
6. Supabase redirects to: `http://localhost:3000/auth/callback`
7. Your app sets session and redirects to home page

---

## ✅ Success Checklist

After completing this guide:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret copied
- [ ] Google provider enabled in Supabase
- [ ] Credentials pasted into Supabase
- [ ] "Continue with Google" button works locally
- [ ] Profile created in database after Google sign-in
- [ ] Can sign out and sign in again with Google

---

## 🎉 You're Done!

Google OAuth is now working! Users can sign up/sign in with either:
- ✅ Email & Password
- ✅ Google Account

Both methods create the same profile structure and work identically in your app.

---

## 📚 Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
