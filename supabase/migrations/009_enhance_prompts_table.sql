-- Migration: Enhance prompts table with optimization tracking
-- Date: 2025-01-11
-- Description: Adds original_prompt field to preserve user input before AI optimization, plus optimization metadata

BEGIN;

-- ============================================================================
-- STEP 1: Add optimization tracking fields
-- ============================================================================

-- Store the original user-entered prompt before AI optimization
ALTER TABLE prompts
  ADD COLUMN original_prompt TEXT;

-- Track which model/provider optimized the prompt
ALTER TABLE prompts
  ADD COLUMN optimized_with TEXT;

-- Count how many times this prompt has been optimized
ALTER TABLE prompts
  ADD COLUMN optimization_count INTEGER DEFAULT 0;

-- Track when the prompt was last optimized
ALTER TABLE prompts
  ADD COLUMN last_optimized_at TIMESTAMPTZ;

-- ============================================================================
-- STEP 2: Create indexes for queries
-- ============================================================================

-- Index for finding prompts that have been optimized
CREATE INDEX idx_prompts_optimized ON prompts(last_optimized_at DESC) WHERE last_optimized_at IS NOT NULL;

-- Index for finding prompts by optimization count
CREATE INDEX idx_prompts_optimization_count ON prompts(optimization_count) WHERE optimization_count > 0;

-- ============================================================================
-- STEP 3: Add helpful comments
-- ============================================================================
COMMENT ON COLUMN prompts.original_prompt IS 'Original user-entered prompt before AI optimization (null if never optimized)';
COMMENT ON COLUMN prompts.optimized_with IS 'Model/provider that optimized the prompt (e.g., "claude-sonnet-4-5", "gpt-4o")';
COMMENT ON COLUMN prompts.optimization_count IS 'Number of times this prompt has been optimized';
COMMENT ON COLUMN prompts.last_optimized_at IS 'Timestamp of the most recent optimization';

-- ============================================================================
-- STEP 4: Add helper function to check if prompt was optimized
-- ============================================================================
CREATE OR REPLACE FUNCTION public.was_optimized(p prompts)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p.original_prompt IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.was_optimized(prompts) IS 'Returns true if the prompt has been optimized by AI';

-- ============================================================================
-- STEP 5: Add trigger to update optimization count
-- ============================================================================
-- Note: The application will handle incrementing optimization_count and setting last_optimized_at
-- This ensures we have accurate tracking even if optimized multiple times

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Next steps:
-- 1. Run migration: supabase db push
-- 2. Update optimize API endpoints to:
--    - Store current content as original_prompt before optimization
--    - Set optimized_with to the model name
--    - Increment optimization_count
--    - Set last_optimized_at timestamp
-- 3. Update UI to show "Original" vs "Optimized" comparison
-- ============================================================================
