-- Add content moderation fields to community_prompts table
-- Migration: 024_add_content_moderation

-- Add moderation columns
ALTER TABLE community_prompts
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_scores JSONB,
ADD COLUMN IF NOT EXISTS moderation_flagged_for TEXT[],
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Add comment to explain moderation_status values
COMMENT ON COLUMN community_prompts.moderation_status IS 'Moderation status: pending, approved, rejected, auto_approved';

-- Create index for pending prompts (for admin dashboard performance)
CREATE INDEX IF NOT EXISTS idx_community_prompts_moderation_status
ON community_prompts(moderation_status)
WHERE moderation_status = 'pending';

-- Create index for moderation history
CREATE INDEX IF NOT EXISTS idx_community_prompts_reviewed_at
ON community_prompts(reviewed_at DESC);

-- Update existing published prompts to 'auto_approved' status
UPDATE community_prompts
SET moderation_status = 'auto_approved'
WHERE moderation_status = 'pending' AND published_at IS NOT NULL;
