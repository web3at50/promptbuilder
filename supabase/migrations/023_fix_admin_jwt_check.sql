-- Migration: Fix admin role check to correctly read from Clerk JWT
-- The previous migration was looking in the wrong place in the JWT structure

-- Drop the old function and all dependent policies
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create corrected function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Try multiple possible locations where Clerk might store the role
  -- Clerk typically puts public_metadata in the 'metadata' claim
  RETURN (
    COALESCE(
      auth.jwt() -> 'metadata' ->> 'role',
      auth.jwt() ->> 'role',
      ''
    ) = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate all admin access policies

-- Add admin access policy for ai_usage_logs
CREATE POLICY "Admins can view all ai usage logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (public.is_admin());

-- Add admin access policy for profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Add admin access policy for prompts
CREATE POLICY "Admins can view all prompts"
  ON public.prompts
  FOR SELECT
  USING (public.is_admin());

-- Add admin access policy for prompt_optimizations
CREATE POLICY "Admins can view all prompt optimizations"
  ON public.prompt_optimizations
  FOR SELECT
  USING (public.is_admin());

COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if the current user has role=admin in their Clerk public_metadata (exposed as metadata or role in JWT). Used for admin-only access policies.';
