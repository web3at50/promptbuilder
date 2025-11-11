'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * ProfileSync Component
 *
 * Automatically syncs Clerk user data to Supabase profiles table on authentication
 * Runs once per session when user is authenticated
 */
export function ProfileSync() {
  const { isSignedIn, user } = useUser();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncProfile = async () => {
      // Only sync if user is signed in and we haven't synced yet
      if (!isSignedIn || !user || synced) {
        return;
      }

      try {
        // Check if profile exists
        const checkResponse = await fetch('/api/profile/sync', {
          method: 'GET',
        });

        if (!checkResponse.ok) {
          console.error('Failed to check profile status');
          return;
        }

        const { needsSync } = await checkResponse.json();

        // Only sync if needed (profile doesn't exist or is outdated)
        if (needsSync) {
          const syncResponse = await fetch('/api/profile/sync', {
            method: 'POST',
          });

          if (syncResponse.ok) {
            console.log('Profile synced successfully');
          } else {
            console.error('Failed to sync profile');
          }
        }

        // Mark as synced for this session
        setSynced(true);
      } catch (error) {
        console.error('Error during profile sync:', error);
      }
    };

    syncProfile();
  }, [isSignedIn, user, synced]);

  // This component doesn't render anything
  return null;
}
