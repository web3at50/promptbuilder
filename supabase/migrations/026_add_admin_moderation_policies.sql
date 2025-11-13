-- Migration: Add admin policies for community_prompts moderation
-- Allows admins to update moderation fields on any community prompt

-- Add admin policy to view all community prompts
CREATE POLICY "Admins can view all community prompts"
  ON public.community_prompts
  FOR SELECT
  USING (public.is_admin());

-- Add admin policy to update community prompts for moderation
CREATE POLICY "Admins can update community prompts for moderation"
  ON public.community_prompts
  FOR UPDATE
  USING (public.is_admin());

-- Add admin policy to delete community prompts if needed
CREATE POLICY "Admins can delete community prompts"
  ON public.community_prompts
  FOR DELETE
  USING (public.is_admin());

COMMENT ON POLICY "Admins can view all community prompts" ON public.community_prompts IS
  'Allows admins to view all community prompts for moderation dashboard';

COMMENT ON POLICY "Admins can update community prompts for moderation" ON public.community_prompts IS
  'Allows admins to update moderation_status, moderation_notes, reviewed_at, and reviewed_by fields';

COMMENT ON POLICY "Admins can delete community prompts" ON public.community_prompts IS
  'Allows admins to remove inappropriate prompts if necessary';
