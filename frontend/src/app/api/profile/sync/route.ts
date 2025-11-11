import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/clerk-supabase';

/**
 * Profile Sync API
 *
 * Syncs Clerk user data to Supabase profiles table
 * Can be called on first login or manually to update profile
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user data from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    // Extract user data from Clerk
    const profileData = {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      clerk_username: user.username || null,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      avatar_url: user.imageUrl || null,
      clerk_metadata: {
        public_metadata: user.publicMetadata,
        unsafe_metadata: user.unsafeMetadata,
        created_at: user.createdAt,
        last_sign_in_at: user.lastSignInAt,
      },
      updated_at: new Date().toISOString(),
    };

    // Upsert to Supabase profiles table
    const supabase = await createClerkSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing profile to Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to sync profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profile synced successfully',
    });
  } catch (error) {
    console.error('Error in profile sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync profile' },
      { status: 500 }
    );
  }
}

/**
 * GET handler to check if profile exists and is up-to-date
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClerkSupabaseClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found
        return NextResponse.json({
          exists: false,
          needsSync: true,
        });
      }

      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: true,
      needsSync: false,
      profile,
    });
  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json(
      { error: 'Failed to check profile' },
      { status: 500 }
    );
  }
}
