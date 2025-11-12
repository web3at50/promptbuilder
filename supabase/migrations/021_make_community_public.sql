-- Migration: Make community prompts publicly readable
-- Date: 2025-01-12
-- Description: Allow unauthenticated users to browse community prompts

BEGIN;

-- ============================================================================
-- Drop and recreate the SELECT policy to allow anonymous access
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view community prompts" ON community_prompts;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can view community prompts"
  ON community_prompts FOR SELECT
  USING (true);

-- Note: This allows both authenticated (via TO authenticated) and anonymous (via TO anon) users
-- By omitting the TO clause, it applies to all roles by default

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Community prompts are now publicly readable by anyone
-- Write operations (INSERT, UPDATE, DELETE) still require authentication
-- ============================================================================
