-- Migration: Convert from Supabase Auth UUIDs to Clerk text-based user IDs
-- Date: 2025-01-11
-- Description: Updates database schema to support Clerk authentication instead of Supabase Auth

BEGIN;

-- ============================================================================
-- STEP 1: Drop existing data (clean slate as agreed)
-- ============================================================================
TRUNCATE TABLE prompts CASCADE;
TRUNCATE TABLE optimization_usage CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- ============================================================================
-- STEP 2: Drop RLS policies FIRST (before changing column types)
-- ============================================================================
-- Policies depend on column types, so we must drop them before altering columns

-- Drop all existing RLS policies for prompts
DROP POLICY IF EXISTS "Allow all operations on prompts" ON prompts;
DROP POLICY IF EXISTS "Users can view own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can view their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;

-- Drop all existing RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Drop all existing RLS policies for optimization_usage
DROP POLICY IF EXISTS "Users can view their own usage" ON optimization_usage;
DROP POLICY IF EXISTS "API can insert usage records" ON optimization_usage;
DROP POLICY IF EXISTS "Users can view own optimization usage" ON optimization_usage;
DROP POLICY IF EXISTS "Users can insert own optimization usage" ON optimization_usage;
DROP POLICY IF EXISTS "Users can view their own optimization usage" ON optimization_usage;
DROP POLICY IF EXISTS "Users can create their own optimization usage" ON optimization_usage;

-- ============================================================================
-- STEP 3: Drop foreign key constraints
-- ============================================================================
-- These reference auth.users which won't be used with Clerk

-- Drop foreign key on prompts.user_id
ALTER TABLE prompts
  DROP CONSTRAINT IF EXISTS prompts_user_id_fkey;

-- Drop foreign key on optimization_usage.user_id
ALTER TABLE optimization_usage
  DROP CONSTRAINT IF EXISTS optimization_usage_user_id_fkey;

-- Drop foreign key on profiles.id
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================================================
-- STEP 4: Change column types from UUID to TEXT
-- ============================================================================

-- Change prompts.user_id from UUID to TEXT
ALTER TABLE prompts
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Change optimization_usage.user_id from UUID to TEXT
ALTER TABLE optimization_usage
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Change profiles.id from UUID to TEXT
ALTER TABLE profiles
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- ============================================================================
-- STEP 5: Recreate RLS policies to use Clerk JWT
-- ============================================================================
-- Replace auth.uid() with (auth.jwt()->>'sub')::text
-- The 'sub' claim contains the Clerk user ID

-- Recreate RLS policies for prompts table using Clerk JWT
CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING ((auth.jwt()->>'sub')::text = user_id);

-- Recreate RLS policies for profiles table using Clerk JWT
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((auth.jwt()->>'sub')::text = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub')::text = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((auth.jwt()->>'sub')::text = id)
  WITH CHECK ((auth.jwt()->>'sub')::text = id);

-- Recreate RLS policies for optimization_usage table using Clerk JWT
CREATE POLICY "Users can view own optimization usage"
  ON optimization_usage FOR SELECT
  USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can insert own optimization usage"
  ON optimization_usage FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- ============================================================================
-- STEP 6: Drop Supabase Auth trigger
-- ============================================================================
-- This trigger created profiles on Supabase auth signup, not needed with Clerk

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================================
-- STEP 7: Add helpful comments
-- ============================================================================
COMMENT ON COLUMN prompts.user_id IS 'Clerk user ID (text format, e.g., user_2abc123...)';
COMMENT ON COLUMN optimization_usage.user_id IS 'Clerk user ID (text format, e.g., user_2abc123...)';
COMMENT ON COLUMN profiles.id IS 'Clerk user ID (text format, e.g., user_2abc123...)';

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Next steps:
-- 1. Run this migration: supabase db push
-- 2. Test sign up with Clerk
-- 3. Create a prompt and verify it saves correctly
-- ============================================================================
