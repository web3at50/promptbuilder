-- Add foreign key relationship between community_prompts and profiles
-- Migration: 025_add_profiles_foreign_key

-- Add foreign key constraint to link community_prompts.user_id to profiles.id
ALTER TABLE community_prompts
ADD CONSTRAINT community_prompts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_community_prompts_user_id
ON community_prompts(user_id);

COMMENT ON CONSTRAINT community_prompts_user_id_fkey ON community_prompts
IS 'Links community prompts to user profiles via Clerk user ID';
