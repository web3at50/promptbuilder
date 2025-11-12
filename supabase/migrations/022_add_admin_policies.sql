-- Migration: Add admin role policies for accessing all user data
-- Admin users (with role='admin' in public_metadata) can access all data

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    COALESCE(
      auth.jwt() -> 'user_metadata' -> 'public_metadata' ->> 'role',
      ''
    ) = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Add admin access policy for prompts (if needed for future admin features)
CREATE POLICY "Admins can view all prompts"
  ON public.prompts
  FOR SELECT
  USING (public.is_admin());

-- Add admin access policy for prompt_optimizations (if needed for future admin features)
CREATE POLICY "Admins can view all prompt optimizations"
  ON public.prompt_optimizations
  FOR SELECT
  USING (public.is_admin());

-- Add comment explaining the admin role
COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if the current user has role=admin in their Clerk public_metadata. Used for admin-only access policies.';
