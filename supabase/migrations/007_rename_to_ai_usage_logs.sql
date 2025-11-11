-- Migration: Rename optimization_usage to ai_usage_logs and add comprehensive tracking
-- Date: 2025-01-11
-- Description: Transforms basic usage tracking into comprehensive AI usage logs with tokens, costs, latency, and model information

BEGIN;

-- ============================================================================
-- STEP 1: Drop existing RLS policies on optimization_usage
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own optimization usage" ON optimization_usage;
DROP POLICY IF EXISTS "Users can insert own optimization usage" ON optimization_usage;

-- ============================================================================
-- STEP 2: Rename table
-- ============================================================================
ALTER TABLE optimization_usage RENAME TO ai_usage_logs;

-- ============================================================================
-- STEP 3: Rename existing column for clarity
-- ============================================================================
-- Keep 'optimized_at' but we'll add 'created_at' as an alias for consistency
ALTER TABLE ai_usage_logs RENAME COLUMN optimized_at TO created_at;

-- ============================================================================
-- STEP 4: Add new comprehensive tracking columns
-- ============================================================================

-- Link to prompt that was optimized (nullable for future non-prompt operations)
ALTER TABLE ai_usage_logs
  ADD COLUMN prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL;

-- AI provider and model information
ALTER TABLE ai_usage_logs
  ADD COLUMN provider TEXT NOT NULL DEFAULT 'anthropic' CHECK (provider IN ('anthropic', 'openai'));

ALTER TABLE ai_usage_logs
  ADD COLUMN model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5-20250929';

-- Operation type (extensible for future operations)
ALTER TABLE ai_usage_logs
  ADD COLUMN operation_type TEXT NOT NULL DEFAULT 'optimize' CHECK (operation_type IN ('optimize', 'generate', 'analyze', 'chat'));

-- Token usage tracking
ALTER TABLE ai_usage_logs
  ADD COLUMN input_tokens INTEGER NOT NULL DEFAULT 0;

ALTER TABLE ai_usage_logs
  ADD COLUMN output_tokens INTEGER NOT NULL DEFAULT 0;

ALTER TABLE ai_usage_logs
  ADD COLUMN total_tokens INTEGER NOT NULL DEFAULT 0;

-- Cost tracking (DECIMAL(10,8) allows for fractions of a cent precision)
ALTER TABLE ai_usage_logs
  ADD COLUMN cost_usd DECIMAL(10, 8) NOT NULL DEFAULT 0.0;

-- Performance tracking
ALTER TABLE ai_usage_logs
  ADD COLUMN latency_ms INTEGER;

-- Success/error tracking
ALTER TABLE ai_usage_logs
  ADD COLUMN success BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE ai_usage_logs
  ADD COLUMN error_message TEXT;

-- API tracking fields
ALTER TABLE ai_usage_logs
  ADD COLUMN api_message_id TEXT;

ALTER TABLE ai_usage_logs
  ADD COLUMN stop_reason TEXT;

-- ============================================================================
-- STEP 5: Create indexes for efficient queries
-- ============================================================================

-- Index for user-based queries (most common)
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);

-- Index for date-based queries (dashboards, analytics)
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

-- Index for prompt association
CREATE INDEX idx_ai_usage_logs_prompt_id ON ai_usage_logs(prompt_id) WHERE prompt_id IS NOT NULL;

-- Index for provider/model analytics
CREATE INDEX idx_ai_usage_logs_provider_model ON ai_usage_logs(provider, model);

-- Composite index for user cost aggregation queries
CREATE INDEX idx_ai_usage_logs_user_cost ON ai_usage_logs(user_id, created_at, cost_usd);

-- Index for admin analytics (total usage, costs, success rates)
CREATE INDEX idx_ai_usage_logs_analytics ON ai_usage_logs(created_at, provider, success);

-- ============================================================================
-- STEP 6: Recreate RLS policies with new table name
-- ============================================================================

-- Users can view their own AI usage logs
CREATE POLICY "Users can view own ai usage logs"
  ON ai_usage_logs FOR SELECT
  USING ((auth.jwt()->>'sub')::text = user_id);

-- Users (via API) can insert their own usage logs
CREATE POLICY "Users can insert own ai usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- Optional: Admin policy for analytics (commented out - enable when admin role is ready)
-- CREATE POLICY "Admins can view all usage logs"
--   ON ai_usage_logs FOR SELECT
--   USING ((auth.jwt()->>'role')::text = 'admin');

-- ============================================================================
-- STEP 7: Add helpful comments
-- ============================================================================
COMMENT ON TABLE ai_usage_logs IS 'Comprehensive tracking of all AI API usage including tokens, costs, latency, and model information';
COMMENT ON COLUMN ai_usage_logs.user_id IS 'Clerk user ID who made the AI request';
COMMENT ON COLUMN ai_usage_logs.prompt_id IS 'Associated prompt ID if this was a prompt optimization';
COMMENT ON COLUMN ai_usage_logs.provider IS 'AI provider: anthropic or openai';
COMMENT ON COLUMN ai_usage_logs.model IS 'Specific model used (e.g., claude-sonnet-4-5-20250929, gpt-4o)';
COMMENT ON COLUMN ai_usage_logs.operation_type IS 'Type of operation: optimize, generate, analyze, or chat';
COMMENT ON COLUMN ai_usage_logs.input_tokens IS 'Number of input/prompt tokens consumed';
COMMENT ON COLUMN ai_usage_logs.output_tokens IS 'Number of output/completion tokens generated';
COMMENT ON COLUMN ai_usage_logs.total_tokens IS 'Total tokens (input + output)';
COMMENT ON COLUMN ai_usage_logs.cost_usd IS 'Calculated cost in USD based on model pricing';
COMMENT ON COLUMN ai_usage_logs.latency_ms IS 'API call latency in milliseconds';
COMMENT ON COLUMN ai_usage_logs.success IS 'Whether the API call succeeded';
COMMENT ON COLUMN ai_usage_logs.error_message IS 'Error message if the call failed';
COMMENT ON COLUMN ai_usage_logs.api_message_id IS 'API-provided message ID for tracking/debugging';
COMMENT ON COLUMN ai_usage_logs.stop_reason IS 'Why generation stopped (end_turn, max_tokens, stop_sequence, etc.)';

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- Next steps:
-- 1. Run migration: supabase db push
-- 2. Update API endpoints to log comprehensive usage data
-- 3. Build usage analytics dashboards
-- ============================================================================
