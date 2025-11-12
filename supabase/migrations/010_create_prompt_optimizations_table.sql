-- Migration: Create prompt_optimizations table for full version history
-- Phase 2: Full History System
-- Description: Store complete history of every optimization attempt

BEGIN;

-- Create the optimizations history table
CREATE TABLE IF NOT EXISTS prompt_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai')),
  model TEXT NOT NULL,
  input_text TEXT NOT NULL,  -- What was sent to the LLM
  output_text TEXT NOT NULL, -- What the LLM returned
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10, 8),
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,

  -- Ensure version increments globally per prompt (not per provider)
  CONSTRAINT unique_version_prompt UNIQUE(prompt_id, version)
);

-- Indexes for performance
CREATE INDEX idx_prompt_optimizations_prompt_id ON prompt_optimizations(prompt_id, version DESC);
CREATE INDEX idx_prompt_optimizations_user_id ON prompt_optimizations(user_id, created_at DESC);
CREATE INDEX idx_prompt_optimizations_provider ON prompt_optimizations(provider, created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompt_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own optimization history
CREATE POLICY "Users can view own optimization history"
  ON prompt_optimizations FOR SELECT
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'sub'::text));

-- RLS Policy: Users can insert their own optimization history
CREATE POLICY "Users can insert own optimization history"
  ON prompt_optimizations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

-- Comments for documentation
COMMENT ON TABLE prompt_optimizations IS 'Full history of all prompt optimizations for version control and comparison';
COMMENT ON COLUMN prompt_optimizations.version IS 'Global version number per prompt, increments with each optimization';
COMMENT ON COLUMN prompt_optimizations.input_text IS 'The prompt text that was sent to the LLM for optimization';
COMMENT ON COLUMN prompt_optimizations.output_text IS 'The optimized prompt returned by the LLM';
COMMENT ON COLUMN prompt_optimizations.provider IS 'AI provider: anthropic or openai';
COMMENT ON COLUMN prompt_optimizations.model IS 'Specific model used (e.g., claude-sonnet-4-5-20250929, gpt-4o)';

COMMIT;
