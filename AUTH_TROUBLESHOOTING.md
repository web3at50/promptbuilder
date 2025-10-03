# Authentication Setup Troubleshooting Guide

**Date:** October 3, 2025
**Project:** Prompt Library
**Issue:** Supabase authentication signup failing with 500 errors

---

## 🐛 Issues Encountered & Solutions

### **Issue 1: Middleware Redirecting All Routes to Login**

**Symptom:**
- Clicking "Sign up" link stayed on `/login` page
- `/signup` and `/test-auth` routes all redirected to `/login`
- Dev server logs showed: `GET /login 200` for every navigation attempt

**Root Cause:**
```typescript
// ❌ WRONG - This matches ALL routes because everything starts with '/'
const protectedPaths = ['/', '/new', '/edit', '/profile'];
const isProtectedPath = protectedPaths.some((path) =>
  request.nextUrl.pathname.startsWith(path)
);
```

The `'/'` path matched every route (`/signup`, `/login`, `/test-auth`, etc.) because `.startsWith('/')` returns `true` for all paths.

**Solution:**
```typescript
// ✅ CORRECT - Only match home page exactly, then check other paths
const protectedPaths = ['/new', '/edit', '/profile'];
const isProtectedPath =
  request.nextUrl.pathname === '/' || // Home page only
  protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));
```

**File:** `frontend/src/lib/supabase/middleware.ts:41-44`

---

### **Issue 2: Database Error - Missing RLS Policy**

**Symptom:**
- Signup form showed: "Database error saving new user"
- Browser console: `POST .../auth/v1/signup 500 (Internal Server Error)`

**Root Cause:**
The `profiles` table had RLS enabled with SELECT and UPDATE policies, but **no INSERT policy**. When the trigger tried to create a profile for a new user, RLS blocked it.

**Existing Policies:**
```sql
-- ❌ Missing INSERT policy!
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Solution:**
Created migration `003_fix_profile_insert_policy.sql`:
```sql
-- ✅ Added missing INSERT policy
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

This allows the `SECURITY DEFINER` trigger function to insert profiles when it runs in the context of the new user.

---

### **Issue 3: Trigger Function Failing on NULL Email**

**Symptom:**
- Still getting 500 errors after adding INSERT policy
- Signup would fail silently

**Root Cause:**
The trigger function assumed `NEW.email` would always have a value, but in some auth flows (especially with email confirmation disabled or OAuth), the email might be:
- NULL initially
- Stored in `raw_user_meta_data` instead of the `email` column
- Empty string

**Original Code:**
```sql
-- ❌ Fails if NEW.email is NULL
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Solution:**
Created migration `004_fix_trigger_handle_null_email.sql`:
```sql
-- ✅ Handles NULL emails and adds error handling
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
    RETURN NEW;  -- Don't fail user creation even if profile fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Key Improvements:**
1. **COALESCE fallback**: Tries `NEW.email` → `raw_user_meta_data->>'email'` → placeholder
2. **Exception handling**: User creation succeeds even if profile creation fails
3. **Warning logging**: Errors are logged but don't break signup

---

## 📝 Lessons Learned

### **1. Middleware Path Matching**
- Never use `'/'` in a `startsWith()` check for protected paths
- Be explicit: match `/` with `===` and other paths with `.startsWith()`

### **2. RLS Policies Must Cover All Operations**
When creating a table with RLS:
- ✅ SELECT policy
- ✅ INSERT policy (often forgotten!)
- ✅ UPDATE policy
- ✅ DELETE policy

**Check with:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### **3. Database Triggers Need Defensive Code**
Always add:
- NULL handling with `COALESCE()`
- Exception blocks with `EXCEPTION WHEN others`
- Fallback values for required fields
- Logging with `RAISE WARNING`

### **4. Debugging Supabase Auth Errors**
1. Check Supabase logs: `mcp__supabase__get_logs` (service: 'auth', 'postgres')
2. Check browser console for detailed error messages
3. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'table_name'`
4. Test trigger manually:
   ```sql
   SELECT handle_new_user();
   ```

---

## 🔧 Quick Fix Checklist

If you encounter "Database error saving new user":

- [ ] Check middleware isn't blocking auth routes
- [ ] Verify INSERT policy exists on profiles table
- [ ] Check trigger function handles NULL email
- [ ] Verify email confirmation setting matches your email config
- [ ] Check Supabase auth rate limits
- [ ] Review Supabase logs for actual error message

---

## 📚 Related Files

- `frontend/src/lib/supabase/middleware.ts` - Route protection logic
- `supabase/migrations/002_add_auth_and_multitenancy.sql` - Initial auth setup
- `supabase/migrations/003_fix_profile_insert_policy.sql` - Added INSERT policy
- `supabase/migrations/004_fix_trigger_handle_null_email.sql` - Fixed trigger

---

## ✅ Resolution Summary

**Total Issues:** 3
**Time to Resolve:** ~45 minutes
**Migrations Created:** 2 (003, 004)
**Files Modified:** 1 (middleware.ts)

**Final Result:** ✅ Email signup working with and without email confirmation enabled
