-- Migration: Fix admin role check to correctly read from Clerk JWT
-- The previous migration was looking in the wrong place in the JWT structure

-- Drop the old function
DROP FUNCTION IF EXISTS public.is_admin();

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

COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if the current user has role=admin in their Clerk public_metadata (exposed as metadata or role in JWT). Used for admin-only access policies.';
