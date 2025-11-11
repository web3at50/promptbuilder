-- Migration: Enhance profiles table with Clerk user data
-- Date: 2025-01-11
-- Description: Adds fields to store rich Clerk user data (name, avatar, metadata, preferences) and future subscription info

BEGIN;

-- ============================================================================
-- STEP 1: Add Clerk user data fields
-- ============================================================================

-- Username from Clerk
ALTER TABLE profiles
  ADD COLUMN clerk_username TEXT;

-- User's first and last name
ALTER TABLE profiles
  ADD COLUMN first_name TEXT;

ALTER TABLE profiles
  ADD COLUMN last_name TEXT;

-- User's avatar/profile image URL
ALTER TABLE profiles
  ADD COLUMN avatar_url TEXT;

-- Flexible storage for Clerk metadata (public_metadata, private_metadata, etc.)
ALTER TABLE profiles
  ADD COLUMN clerk_metadata JSONB DEFAULT '{}'::jsonb;

-- User preferences (UI settings, default AI provider, theme, etc.)
ALTER TABLE profiles
  ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;

-- Future subscription/tier tracking
ALTER TABLE profiles
  ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- ============================================================================
-- STEP 2: Create indexes for common queries
-- ============================================================================

-- Index for username lookups (if we add public profiles feature)
CREATE INDEX idx_profiles_clerk_username ON profiles(clerk_username) WHERE clerk_username IS NOT NULL;

-- GIN index for JSONB queries on metadata and preferences
CREATE INDEX idx_profiles_clerk_metadata ON profiles USING GIN (clerk_metadata);
CREATE INDEX idx_profiles_preferences ON profiles USING GIN (preferences);

-- Index for subscription tier queries
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- ============================================================================
-- STEP 3: Add helpful comments
-- ============================================================================
COMMENT ON COLUMN profiles.clerk_username IS 'Clerk username (may not be unique across all Clerk apps)';
COMMENT ON COLUMN profiles.first_name IS 'User''s first name from Clerk';
COMMENT ON COLUMN profiles.last_name IS 'User''s last name from Clerk';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user''s profile image from Clerk';
COMMENT ON COLUMN profiles.clerk_metadata IS 'Flexible JSONB storage for Clerk public/private metadata';
COMMENT ON COLUMN profiles.preferences IS 'User preferences: theme, default_ai_provider, notification settings, etc.';
COMMENT ON COLUMN profiles.subscription_tier IS 'User''s subscription level: free, pro, or enterprise';

-- ============================================================================
-- STEP 4: Add helper function for getting full name
-- ============================================================================
-- Convenience function to get formatted full name
CREATE OR REPLACE FUNCTION public.get_full_name(p profiles)
RETURNS TEXT AS $$
BEGIN
  IF p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN
    RETURN p.first_name || ' ' || p.last_name;
  ELSIF p.first_name IS NOT NULL THEN
    RETURN p.first_name;
  ELSIF p.last_name IS NOT NULL THEN
    RETURN p.last_name;
  ELSIF p.clerk_username IS NOT NULL THEN
    RETURN p.clerk_username;
  ELSE
    RETURN p.email;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_full_name(profiles) IS 'Returns formatted full name with fallback to username or email';

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Next steps:
-- 1. Run migration: supabase db push
-- 2. Create profile sync API endpoint to populate these fields from Clerk
-- 3. Update UI to display user names and avatars
-- ============================================================================
