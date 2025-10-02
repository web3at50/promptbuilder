-- Migration: Add Authentication and Multi-tenancy Support
-- Created: 2025-10-02
-- Description: Adds user_id to prompts, creates profiles table, adds usage tracking

-- ============================================
-- STEP 1: Clear existing data (per user request)
-- ============================================
DELETE FROM prompts;

-- ============================================
-- STEP 2: Add user_id to prompts table
-- ============================================
ALTER TABLE prompts ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL;

-- Add index for performance
CREATE INDEX idx_prompts_user_id ON prompts(user_id);

-- ============================================
-- STEP 3: Update RLS policies for prompts
-- ============================================

-- Remove old "allow all" policy
DROP POLICY IF EXISTS "Allow all operations on prompts" ON prompts;

-- Create user-scoped policies
CREATE POLICY "Users can view their own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: Create profiles table
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view/update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 5: Create trigger to auto-create profile
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 6: Create optimization usage tracking table
-- ============================================
CREATE TABLE optimization_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  optimized_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE optimization_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
  ON optimization_usage FOR SELECT
  USING (auth.uid() = user_id);

-- API can insert usage records
CREATE POLICY "API can insert usage records"
  ON optimization_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_optimization_usage_user_id ON optimization_usage(user_id);

-- ============================================
-- STEP 7: Create helpful views for profile stats
-- ============================================

-- Note: Views with auth.uid() can be created but might need to be
-- replaced with functions for better RLS integration
-- For now, we'll query directly in the app

COMMENT ON TABLE profiles IS 'User profile information, auto-created on signup';
COMMENT ON TABLE optimization_usage IS 'Tracks AI optimization usage per user for stats and future rate limiting';
COMMENT ON COLUMN prompts.user_id IS 'Owner of this prompt, enforced via RLS';
