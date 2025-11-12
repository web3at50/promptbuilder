import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Check if the current user has admin role
 * Checks user.publicMetadata.role === 'admin'
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();

    if (!user) {
      return false;
    }

    // Check if user has admin role in public metadata
    const metadata = user.publicMetadata as { role?: string };
    return metadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin status and user ID
 * Throws error if user is not admin
 */
export async function requireAdmin(): Promise<{ userId: string; isAdmin: true }> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user session');
  }

  const adminStatus = await isAdmin();

  if (!adminStatus) {
    throw new Error('Forbidden: Admin access required');
  }

  return { userId, isAdmin: true };
}

/**
 * Get current user's admin status
 * Returns null if not authenticated
 */
export async function getAdminStatus(): Promise<{
  userId: string;
  isAdmin: boolean;
  email: string | null;
  fullName: string | null;
} | null> {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    const metadata = user.publicMetadata as { role?: string };
    const isAdminUser = metadata?.role === 'admin';

    return {
      userId: user.id,
      isAdmin: isAdminUser,
      email: user.emailAddresses[0]?.emailAddress || null,
      fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
    };
  } catch (error) {
    console.error('Error getting admin status:', error);
    return null;
  }
}
