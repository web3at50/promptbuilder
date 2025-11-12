-- Migration: Create community sharing tables
-- Date: 2025-01-12
-- Description: Enables public prompt library with likes, forks, and community engagement

BEGIN;

-- ============================================================================
-- STEP 1: Add new columns to prompts table for public sharing
-- ============================================================================

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Index for public prompts
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public, created_at DESC) WHERE is_public = true;

-- ============================================================================
-- STEP 2: Create community_prompts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  like_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_token TEXT UNIQUE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_public_prompt UNIQUE(prompt_id)
);

-- ============================================================================
-- STEP 3: Create community_prompt_likes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_prompt_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_prompt_id UUID NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_like_per_user UNIQUE(community_prompt_id, user_id)
);

-- ============================================================================
-- STEP 4: Create community_prompt_forks table
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_prompt_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_prompt_id UUID NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  forked_prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_community_prompts_category ON community_prompts(category, like_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompts_featured ON community_prompts(is_featured, like_count DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_community_prompts_recent ON community_prompts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompts_popular ON community_prompts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompts_user ON community_prompts(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompt_likes_user ON community_prompt_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_prompt_likes_prompt ON community_prompt_likes(community_prompt_id);
CREATE INDEX IF NOT EXISTS idx_community_prompt_forks_user ON community_prompt_forks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_prompt_forks_prompt ON community_prompt_forks(community_prompt_id);

-- ============================================================================
-- STEP 6: Enable RLS and create policies
-- ============================================================================

-- Community Prompts RLS
ALTER TABLE community_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community prompts"
  ON community_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can publish own prompts"
  ON community_prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update own published prompts"
  ON community_prompts FOR UPDATE
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can delete own published prompts"
  ON community_prompts FOR DELETE
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text));

-- Community Prompt Likes RLS
ALTER TABLE community_prompt_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON community_prompt_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like prompts"
  ON community_prompt_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can unlike prompts"
  ON community_prompt_likes FOR DELETE
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text));

-- Community Prompt Forks RLS
ALTER TABLE community_prompt_forks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forks"
  ON community_prompt_forks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can fork prompts"
  ON community_prompt_forks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

-- ============================================================================
-- STEP 7: Add helpful comments
-- ============================================================================

COMMENT ON TABLE community_prompts IS 'Public gallery of shared prompts with engagement metrics';
COMMENT ON COLUMN community_prompts.share_token IS 'Unique token for public URL access';
COMMENT ON COLUMN community_prompts.is_featured IS 'Admin can manually feature best prompts';
COMMENT ON COLUMN community_prompts.category IS 'Prompt category: coding, writing, marketing, etc.';

COMMENT ON TABLE community_prompt_likes IS 'Tracks which users liked which community prompts';
COMMENT ON TABLE community_prompt_forks IS 'Tracks when users copy community prompts to their library';

COMMENT ON COLUMN prompts.share_token IS 'Public sharing token - same as community_prompts.share_token when published';
COMMENT ON COLUMN prompts.is_public IS 'Whether this prompt is published to community';
COMMENT ON COLUMN prompts.view_count IS 'Number of views when public';

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Next steps:
-- 1. Run migration: supabase db push
-- 2. Create publishing API endpoints
-- 3. Build community gallery UI
-- ============================================================================
